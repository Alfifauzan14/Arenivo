-- =====================================================================
-- 0003_functions.sql — 8 fungsi transaksi inti (PRD 6.2) + helper
-- Kesalahan bisnis dilempar sebagai exception dengan MESSAGE = kode error API
-- (mis. 'SLOT_TAKEN'), dipetakan oleh repository backend.
-- =====================================================================

create or replace function get_setting_int(p_key text, p_default integer) returns integer
language sql stable as $$
  select coalesce((select (value #>> '{}')::integer from system_settings where key = p_key), p_default)
$$;

-- Harga satu slot: aturan harga dinamis (prioritas tertinggi) atau base_price. Waktu dihitung WIB.
create or replace function slot_price(p_field_id uuid, p_slot_start timestamptz) returns integer
language plpgsql stable as $$
declare
  v_local timestamp := p_slot_start at time zone 'Asia/Jakarta';
  v_dow smallint := extract(dow from v_local)::smallint;
  v_time time := v_local::time;
  v_price integer;
begin
  select price into v_price from field_price_rules
   where field_id = p_field_id
     and (day_of_week is null or day_of_week = v_dow)
     and start_time <= v_time and v_time < case when end_time = '00:00' then '23:59:59.999'::time else end_time end
   order by priority desc limit 1;
  if v_price is null then select base_price into v_price from fields where id = p_field_id; end if;
  return v_price;
end $$;

-- Pastikan semua slot berada dalam jam operasional (WIB)
create or replace function assert_operating_hours(p_field_id uuid, p_slot_starts timestamptz[]) returns void
language plpgsql stable as $$
declare
  s timestamptz; v_local timestamp; v_open time; v_close time; v_closed boolean;
  v_start_min integer; v_close_min integer;
begin
  foreach s in array p_slot_starts loop
    v_local := s at time zone 'Asia/Jakarta';
    select open_time, close_time, is_closed into v_open, v_close, v_closed
      from field_operating_hours where field_id = p_field_id and day_of_week = extract(dow from v_local)::smallint;
    if not found or v_closed then raise exception 'OUT_OF_OPERATING_HOURS'; end if;
    v_start_min := extract(hour from v_local)::int * 60 + extract(minute from v_local)::int;
    v_close_min := case when v_close = '00:00' then 1440
                        else extract(hour from v_close)::int * 60 + extract(minute from v_close)::int end;
    if v_start_min < (extract(hour from v_open)::int * 60 + extract(minute from v_open)::int)
       or v_start_min + 60 > v_close_min then
      raise exception 'OUT_OF_OPERATING_HOURS';
    end if;
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- 1. create_booking
-- ---------------------------------------------------------------------
create or replace function create_booking(
  p_user_id uuid, p_field_id uuid, p_customer_name text, p_customer_phone text,
  p_slot_starts timestamptz[], p_promo_code text default null, p_notes text default null,
  p_idempotency_key text default null, p_source booking_source default 'online', p_created_by uuid default null
) returns bookings
language plpgsql as $$
declare
  v_booking bookings; v_field fields; v_venue venues;
  v_slots timestamptz[]; s timestamptz; i integer;
  v_expire_min integer; v_max_days integer; v_comm_pct integer; v_fee integer;
  v_subtotal integer := 0; v_price integer; v_discount integer := 0;
  v_promo promos; v_promo_id uuid; v_promo_global boolean := false;
  v_comm_rate numeric; v_platform_comm integer; v_mitra_amount integer; v_total integer;
  v_code text; v_status booking_status;
begin
  -- idempotency
  if p_idempotency_key is not null and p_user_id is not null then
    select * into v_booking from bookings where user_id = p_user_id and idempotency_key = p_idempotency_key;
    if found then return v_booking; end if;
  end if;

  select * into v_field from fields where id = p_field_id and status = 'aktif';
  if not found then raise exception 'NOT_FOUND'; end if;
  select * into v_venue from venues where id = v_field.venue_id and status = 'aktif';
  if not found then raise exception 'NOT_FOUND'; end if;

  select array_agg(x order by x) into v_slots from unnest(p_slot_starts) x;
  if v_slots is null or array_length(v_slots,1) < 1 then raise exception 'VALIDATION_ERROR'; end if;
  for i in 2..array_length(v_slots,1) loop
    if v_slots[i] <> v_slots[i-1] + interval '1 hour' then raise exception 'VALIDATION_ERROR'; end if;
  end loop;

  v_expire_min := get_setting_int('booking_expiration_minutes', 15);
  v_max_days   := get_setting_int('max_booking_days_ahead', 30);
  v_comm_pct   := get_setting_int('default_platform_commission_percent', 10);
  v_fee        := get_setting_int('default_service_fee_rupiah', 5000);

  if p_source = 'online' then
    if v_slots[1] <= now() then raise exception 'OUT_OF_OPERATING_HOURS'; end if;
  end if;
  if v_slots[array_length(v_slots,1)] > now() + (v_max_days || ' days')::interval then
    raise exception 'OUT_OF_OPERATING_HOURS';
  end if;
  perform assert_operating_hours(p_field_id, v_slots);

  -- lepas kunci kedaluwarsa dalam transaksi yang sama
  update bookings set status = 'kedaluwarsa'
   where status = 'menunggu_bayar' and expires_at < now()
     and id in (select booking_id from slot_reservations where field_id = p_field_id
                 and slot_start = any(v_slots) and is_active and booking_id is not null);
  update slot_reservations set is_active = false
   where field_id = p_field_id and slot_start = any(v_slots) and is_active
     and booking_id in (select id from bookings where status = 'kedaluwarsa');

  foreach s in array v_slots loop
    v_subtotal := v_subtotal + slot_price(p_field_id, s);
  end loop;

  if p_source = 'manual' then
    v_fee := 0; v_comm_rate := 0; v_status := 'dikonfirmasi';
  else
    v_comm_rate := v_comm_pct::numeric / 100; v_status := 'menunggu_bayar';
    if p_promo_code is not null and length(trim(p_promo_code)) > 0 then
      select * into v_promo from promos where upper(code) = upper(trim(p_promo_code)) and is_active
         and now() between start_date and end_date and (quota = 0 or used_count < quota)
         and (venue_id is null or venue_id = v_field.venue_id) and min_spend <= v_subtotal;
      if not found then raise exception 'PROMO_INVALID'; end if;
      v_discount := case when v_promo.discount_type = 'fixed' then v_promo.discount_value
                         else least(round(v_subtotal * v_promo.discount_value / 100.0)::int,
                                    coalesce(v_promo.max_discount, 2147483647)) end;
      v_discount := least(v_discount, v_subtotal);
      v_promo_id := v_promo.id; v_promo_global := v_promo.venue_id is null;
    end if;
  end if;

  v_platform_comm := round(v_subtotal * v_comm_rate)::int;
  v_total := v_subtotal + v_fee - v_discount;
  -- diskon venue ditanggung mitra, diskon global ditanggung platform
  v_mitra_amount := v_subtotal - v_platform_comm - case when v_promo_global then 0 else v_discount end;
  if p_source = 'manual' then v_mitra_amount := v_subtotal; end if;

  v_code := 'FB-' || upper(substr(translate(encode(gen_random_bytes(6),'base64'),'+/=','XYZ'),1,6));

  insert into bookings(booking_code,user_id,customer_name,customer_phone,field_id,venue_id,play_start,play_end,
      total_hours,source,status,subtotal,service_fee,discount,total_price,commission_rate,platform_commission,
      mitra_amount,promo_id,promo_is_global,expires_at,notes,idempotency_key)
  values (v_code,p_user_id,p_customer_name,p_customer_phone,p_field_id,v_field.venue_id,v_slots[1],
      v_slots[array_length(v_slots,1)] + interval '1 hour',array_length(v_slots,1),p_source,v_status,
      v_subtotal,v_fee,v_discount,v_total,v_comm_rate,v_platform_comm,v_mitra_amount,v_promo_id,v_promo_global,
      case when p_source = 'online' then now() + (v_expire_min || ' minutes')::interval end,
      p_notes,p_idempotency_key)
  returning * into v_booking;

  begin
    foreach s in array v_slots loop
      insert into slot_reservations(field_id,slot_start,slot_end,type,booking_id,price,created_by)
      values (p_field_id,s,s + interval '1 hour','booking',v_booking.id,slot_price(p_field_id,s),coalesce(p_created_by,p_user_id));
    end loop;
  exception when unique_violation then
    raise exception 'SLOT_TAKEN';
  end;

  return v_booking;
end $$;

-- ---------------------------------------------------------------------
-- 2. confirm_payment (idempotent, dipanggil webhook)
-- ---------------------------------------------------------------------
create or replace function confirm_payment(
  p_order_id text, p_transaction_id text, p_payment_type text, p_raw jsonb default null
) returns bookings
language plpgsql as $$
declare
  v_pay payments; v_b bookings; v_hour timestamptz; v_paid integer;
begin
  select * into v_pay from payments where midtrans_order_id = p_order_id for update;
  if not found then raise exception 'NOT_FOUND'; end if;
  select * into v_b from bookings where id = v_pay.booking_id for update;

  if v_pay.status = 'berhasil' then return v_b; end if;

  update payments set status = 'berhasil', paid_at = now(), midtrans_transaction_id = p_transaction_id,
         payment_type = p_payment_type, raw_notification = p_raw where id = v_pay.id;

  if v_b.status = 'kedaluwarsa' then
    -- coba hidupkan kembali jika slot masih kosong
    begin
      v_hour := v_b.play_start;
      while v_hour < v_b.play_end loop
        insert into slot_reservations(field_id,slot_start,slot_end,type,booking_id,price,created_by)
        values (v_b.field_id,v_hour,v_hour + interval '1 hour','booking',v_b.id,slot_price(v_b.field_id,v_hour),v_b.user_id);
        v_hour := v_hour + interval '1 hour';
      end loop;
    exception when unique_violation then
      -- slot sudah diambil orang lain: pembayaran tetap tercatat, booking tetap kedaluwarsa, refund penuh otomatis
      insert into refunds(booking_id,payment_id,amount,refund_percent,status,reason)
      values (v_b.id,v_pay.id,v_pay.gross_amount,100,'diajukan','Pembayaran terlambat: slot sudah dipesan pihak lain');
      return v_b;
    end;
  end if;

  if v_b.status in ('menunggu_bayar','kedaluwarsa') then
    update bookings set status = 'dikonfirmasi', expires_at = null where id = v_b.id returning * into v_b;
    update slot_reservations set is_active = true where booking_id = v_b.id;
    insert into tickets(booking_id,ticket_code)
      values (v_b.id, 'TKT-' || v_b.booking_code || '-' || upper(substr(encode(gen_random_bytes(3),'hex'),1,3)))
      on conflict (booking_id) do nothing;
    if v_b.promo_id is not null then update promos set used_count = used_count + 1 where id = v_b.promo_id; end if;
  end if;
  return v_b;
end $$;

-- ---------------------------------------------------------------------
-- 3. expire_bookings (pg_cron tiap menit)
-- ---------------------------------------------------------------------
create or replace function expire_bookings() returns integer
language plpgsql as $$
declare v_count integer;
begin
  with ex as (
    update bookings set status = 'kedaluwarsa'
     where status = 'menunggu_bayar' and expires_at < now() returning id
  ), rel as (
    update slot_reservations set is_active = false
     where booking_id in (select id from ex) and is_active returning 1
  ), pay as (
    update payments set status = 'kedaluwarsa'
     where booking_id in (select id from ex) and status = 'pending' returning 1
  )
  select count(*) into v_count from ex;
  return v_count;
end $$;

-- ---------------------------------------------------------------------
-- 4. cancel_booking
-- ---------------------------------------------------------------------
create or replace function cancel_booking(
  p_booking_id uuid, p_actor_id uuid, p_actor_role user_role, p_reason text
) returns bookings
language plpgsql as $$
declare
  v_b bookings; v_pay payments; v_hours numeric; v_pct integer := 0; v_amount integer;
  v_mitra_user uuid; v_was_paid boolean;
begin
  select * into v_b from bookings where id = p_booking_id for update;
  if not found then raise exception 'NOT_FOUND'; end if;

  if p_actor_role = 'penyewa' and v_b.user_id is distinct from p_actor_id then raise exception 'NOT_FOUND'; end if;
  if p_actor_role = 'mitra' then
    select mp.user_id into v_mitra_user from venues v join mitra_profiles mp on mp.id = v.mitra_id
      where v.id = v_b.venue_id and mp.user_id = p_actor_id;
    if v_mitra_user is null then raise exception 'NOT_FOUND'; end if;
  end if;

  if v_b.status not in ('menunggu_bayar','dikonfirmasi') then raise exception 'CANCEL_NOT_ALLOWED'; end if;

  select * into v_pay from payments where booking_id = v_b.id and status = 'berhasil' limit 1;
  v_was_paid := found;

  update bookings set status = 'dibatalkan', cancelled_by = p_actor_id, cancelled_at = now(), cancel_reason = p_reason
   where id = v_b.id returning * into v_b;
  update slot_reservations set is_active = false where booking_id = v_b.id;
  update tickets set status = 'dibatalkan' where booking_id = v_b.id;

  if v_was_paid and v_b.source = 'online' then
    if p_actor_role = 'mitra' or p_actor_role = 'admin' then
      v_pct := 100; v_amount := v_b.total_price;  -- mitra batal: 100% termasuk biaya layanan
    else
      v_hours := extract(epoch from (v_b.play_start - now())) / 3600;
      select refund_percent into v_pct from refund_rules
       where (venue_id = v_b.venue_id or venue_id is null) and min_hours_before <= v_hours
       order by (venue_id is not null) desc, min_hours_before desc limit 1;
      v_pct := coalesce(v_pct, 0);
      v_amount := round((v_b.total_price - v_b.service_fee) * v_pct / 100.0)::int; -- biaya layanan tidak kembali
    end if;
    if v_amount > 0 or v_pct = 0 then
      insert into refunds(booking_id,payment_id,amount,refund_percent,status,reason,requested_by)
      values (v_b.id,v_pay.id,v_amount,v_pct, case when v_amount > 0 then 'diajukan' else 'ditolak' end, p_reason, p_actor_id);
    end if;
  end if;
  return v_b;
end $$;

-- ---------------------------------------------------------------------
-- 5. complete_booking (pg_cron): selesai + saldo mitra bertambah
-- ---------------------------------------------------------------------
create or replace function complete_booking() returns integer
language plpgsql as $$
declare v_count integer;
begin
  with done as (
    update bookings set status = 'selesai'
     where status in ('dikonfirmasi','digunakan') and play_end < now() returning *
  ), ins as (
    insert into mitra_balance_entries(mitra_id,booking_id,amount,description)
    select v.mitra_id, d.id, d.mitra_amount, 'Pendapatan booking ' || d.booking_code
      from done d join venues v on v.id = d.venue_id
     where d.source = 'online'
    returning 1
  )
  select count(*) into v_count from done;
  return v_count;
end $$;

-- ---------------------------------------------------------------------
-- 6. validate_ticket (Gate Scanner)
-- ---------------------------------------------------------------------
create or replace function validate_ticket(
  p_code text, p_venue_id uuid, p_scanned_by uuid
) returns jsonb
language plpgsql as $$
declare
  v_t tickets; v_b bookings; v_result scan_result; v_early integer;
begin
  v_early := get_setting_int('scanner_early_checkin_minutes', 30);
  select * into v_t from tickets where ticket_code = upper(trim(p_code)) for update;

  if not found then
    v_result := 'tidak_ditemukan';
  else
    select * into v_b from bookings where id = v_t.booking_id;
    if v_b.venue_id <> p_venue_id then v_result := 'salah_venue';
    elsif v_t.status = 'dibatalkan' or v_b.status = 'dibatalkan' then v_result := 'dibatalkan';
    elsif v_t.status = 'digunakan' then v_result := 'sudah_dipakai';
    elsif v_b.status = 'menunggu_bayar' then v_result := 'belum_dibayar';
    elsif now() < v_b.play_start - (v_early || ' minutes')::interval or now() > v_b.play_end then v_result := 'salah_waktu';
    else
      v_result := 'sah';
      update tickets set status = 'digunakan', used_at = now(), checked_in_by = p_scanned_by where id = v_t.id;
      update bookings set status = 'digunakan' where id = v_b.id and status = 'dikonfirmasi';
    end if;
  end if;

  insert into ticket_scans(ticket_id,scanned_code,venue_id,scanned_by,result)
  values (v_t.id, p_code, p_venue_id, p_scanned_by, v_result);

  return jsonb_build_object(
    'result', v_result,
    'bookingCode', v_b.booking_code, 'customerName', v_b.customer_name,
    'fieldId', v_b.field_id, 'playStart', v_b.play_start, 'playEnd', v_b.play_end,
    'usedAt', (select used_at from tickets where id = v_t.id)
  );
end $$;

-- ---------------------------------------------------------------------
-- 7. reschedule_booking
-- ---------------------------------------------------------------------
create or replace function reschedule_booking(
  p_booking_id uuid, p_user_id uuid, p_new_slot_starts timestamptz[]
) returns bookings
language plpgsql as $$
declare
  v_b bookings; v_slots timestamptz[]; s timestamptz; i integer; v_new_subtotal integer := 0;
begin
  select * into v_b from bookings where id = p_booking_id and user_id = p_user_id for update;
  if not found then raise exception 'NOT_FOUND'; end if;
  if v_b.status <> 'dikonfirmasi' or v_b.reschedule_count >= 1
     or v_b.play_start - now() < interval '24 hours' then
    raise exception 'RESCHEDULE_NOT_ALLOWED';
  end if;

  select array_agg(x order by x) into v_slots from unnest(p_new_slot_starts) x;
  if array_length(v_slots,1) <> v_b.total_hours then raise exception 'RESCHEDULE_NOT_ALLOWED'; end if;
  for i in 2..array_length(v_slots,1) loop
    if v_slots[i] <> v_slots[i-1] + interval '1 hour' then raise exception 'VALIDATION_ERROR'; end if;
  end loop;
  if v_slots[1] <= now() then raise exception 'RESCHEDULE_NOT_ALLOWED'; end if;
  perform assert_operating_hours(v_b.field_id, v_slots);

  foreach s in array v_slots loop v_new_subtotal := v_new_subtotal + slot_price(v_b.field_id, s); end loop;
  if v_new_subtotal <> v_b.subtotal then raise exception 'RESCHEDULE_NOT_ALLOWED'; end if;

  update slot_reservations set is_active = false where booking_id = v_b.id;
  begin
    foreach s in array v_slots loop
      insert into slot_reservations(field_id,slot_start,slot_end,type,booking_id,price,created_by)
      values (v_b.field_id,s,s + interval '1 hour','booking',v_b.id,slot_price(v_b.field_id,s),p_user_id);
    end loop;
  exception when unique_violation then raise exception 'SLOT_TAKEN';
  end;

  update bookings set play_start = v_slots[1], play_end = v_slots[array_length(v_slots,1)] + interval '1 hour',
         reschedule_count = reschedule_count + 1 where id = v_b.id returning * into v_b;
  return v_b;
end $$;

-- ---------------------------------------------------------------------
-- 8. request_payout
-- ---------------------------------------------------------------------
create or replace function request_payout(p_mitra_id uuid, p_amount integer) returns payouts
language plpgsql as $$
declare v_m mitra_profiles; v_min integer; v_avail integer; v_p payouts;
begin
  select * into v_m from mitra_profiles where id = p_mitra_id for update;
  if not found then raise exception 'NOT_FOUND'; end if;
  if v_m.bank_account_number is null or v_m.bank_name is null then raise exception 'VALIDATION_ERROR'; end if;

  v_min := get_setting_int('min_payout_amount_rupiah', 100000);
  if p_amount < v_min then raise exception 'PAYOUT_BELOW_MINIMUM'; end if;

  select saldo_bisa_dicairkan into v_avail from mitra_balances where mitra_id = p_mitra_id;
  if coalesce(v_avail,0) < p_amount then raise exception 'INSUFFICIENT_BALANCE'; end if;

  insert into payouts(mitra_id,amount,bank_name,bank_account_number,bank_account_holder)
  values (p_mitra_id,p_amount,v_m.bank_name,v_m.bank_account_number,coalesce(v_m.bank_account_holder,v_m.business_name))
  returning * into v_p;
  return v_p;
end $$;

-- ---------------------------------------------------------------------
-- Helper: selesaikan payout (atomik, menulis entri buku besar minus)
-- ---------------------------------------------------------------------
create or replace function complete_payout(p_payout_id uuid, p_admin_id uuid, p_reference text) returns payouts
language plpgsql as $$
declare v_p payouts;
begin
  select * into v_p from payouts where id = p_payout_id for update;
  if not found then raise exception 'NOT_FOUND'; end if;
  if v_p.status not in ('menunggu','disetujui','diproses') then raise exception 'INVALID_STATUS_TRANSITION'; end if;
  update payouts set status = 'selesai', transfer_reference = p_reference, processed_by = p_admin_id, processed_at = now()
   where id = p_payout_id returning * into v_p;
  insert into mitra_balance_entries(mitra_id,payout_id,amount,description)
  values (v_p.mitra_id, v_p.id, -v_p.amount, 'Pencairan dana ke ' || v_p.bank_name || ' ' || v_p.bank_account_number);
  return v_p;
end $$;

-- ---------------------------------------------------------------------
-- Penjadwalan pg_cron (aktifkan extension pg_cron di Supabase terlebih dahulu)
-- ---------------------------------------------------------------------
-- select cron.schedule('expire-bookings','* * * * *','select expire_bookings()');
-- select cron.schedule('complete-bookings','*/5 * * * *','select complete_booking()');
