-- =====================================================================
-- 0004_fix_mitra_balance_escrow.sql
-- Sinkronisasi real-time Escrow (dikonfirmasi) & Saldo Siap Cair (digunakan/selesai) ke Mitra
-- =====================================================================

-- 1. Satu booking online hanya boleh dikreditkan maksimal 1x ke buku besar saldo mitra
create unique index if not exists mitra_balance_entries_booking_uniq
  on public.mitra_balance_entries(booking_id)
  where booking_id is not null;

-- 2. Perbarui view mitra_balances agar mencerminkan dana Escrow booking 'dikonfirmasi'
create or replace view public.mitra_balances as
select
  mp.id as mitra_id,
  (
    coalesce(sum(e.amount), 0)
    + coalesce((
        select sum(b.mitra_amount)
          from public.bookings b
          join public.venues v on v.id = b.venue_id
         where v.mitra_id = mp.id
           and b.source = 'online'
           and b.status in ('dikonfirmasi', 'digunakan', 'selesai')
           and not exists (select 1 from public.mitra_balance_entries mbe where mbe.booking_id = b.id)
      ), 0)
  )::integer as saldo_total,
  (
    coalesce((select sum(p.amount) from public.payouts p where p.mitra_id = mp.id and p.status in ('menunggu', 'disetujui', 'diproses')), 0)
    + coalesce((
        select sum(b.mitra_amount)
          from public.bookings b
          join public.venues v on v.id = b.venue_id
         where v.mitra_id = mp.id
           and b.source = 'online'
           and b.status = 'dikonfirmasi'
           and not exists (select 1 from public.mitra_balance_entries mbe where mbe.booking_id = b.id)
      ), 0)
  )::integer as saldo_tertahan,
  (
    coalesce(sum(e.amount), 0)
    - coalesce((select sum(p.amount) from public.payouts p where p.mitra_id = mp.id and p.status in ('menunggu', 'disetujui', 'diproses')), 0)
  )::integer as saldo_bisa_dicairkan
from public.mitra_profiles mp
left join public.mitra_balance_entries e on e.mitra_id = mp.id
group by mp.id;

-- 3. Saat QR e-tiket valid dipindai di Gate Scanner (digunakan), langsung kreditkan saldo siap cair mitra
create or replace function public.validate_ticket(
  p_code text, p_venue_id uuid, p_scanned_by uuid
) returns jsonb
language plpgsql as $$
declare
  v_t tickets; v_b bookings; v_result scan_result; v_early integer; v_mitra_id uuid;
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
      if v_b.source = 'online' and v_b.mitra_amount > 0 then
        select mitra_id into v_mitra_id from venues where id = v_b.venue_id;
        if v_mitra_id is not null then
          insert into mitra_balance_entries(mitra_id, booking_id, amount, description)
          values (v_mitra_id, v_b.id, v_b.mitra_amount, 'Pendapatan booking ' || v_b.booking_code)
          on conflict (booking_id) where booking_id is not null do nothing;
        end if;
      end if;
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

-- 4. Pastikan complete_booking aman terhadap duplikasi bila booking sudah dikreditkan saat check-in QR
create or replace function public.complete_booking() returns integer
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
       and d.mitra_amount > 0
    on conflict (booking_id) where booking_id is not null do nothing
    returning 1
  )
  select count(*) into v_count from done;
  return v_count;
end $$;

-- 5. Backfill booking 'digunakan' / 'selesai' yang sudah ada agar saldo mitra langsung sinkron
insert into public.mitra_balance_entries(mitra_id, booking_id, amount, description, created_at)
select v.mitra_id, b.id, b.mitra_amount, 'Pendapatan booking ' || b.booking_code, b.updated_at
  from public.bookings b
  join public.venues v on v.id = b.venue_id
 where b.source = 'online'
   and b.status in ('digunakan', 'selesai')
   and b.mitra_amount > 0
on conflict (booking_id) where booking_id is not null do nothing;
