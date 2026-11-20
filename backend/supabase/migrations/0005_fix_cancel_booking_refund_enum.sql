-- =====================================================================
-- 0005_fix_cancel_booking_refund_enum.sql
-- Cast explicit ke enum refund_status pada CASE WHEN insert refunds di cancel_booking
-- =====================================================================

create or replace function public.cancel_booking(
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
      values (v_b.id,v_pay.id,v_amount,v_pct, (case when v_amount > 0 then 'diajukan' else 'ditolak' end)::refund_status, p_reason, p_actor_id);
    end if;
  end if;
  return v_b;
end $$;
