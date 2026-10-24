-- =====================================================================
-- 0002_rls.sql — Row Level Security
-- Backend memakai service role (bypass RLS). RLS menjaga akses langsung via anon/auth key.
-- =====================================================================
create or replace function current_role_name() returns text language sql stable security definer as $$
  select role::text from profiles where id = auth.uid()
$$;

do $$
declare t text;
begin
  for t in select table_name from information_schema.tables
           where table_schema='public' and table_type='BASE TABLE'
  loop
    execute format('alter table %I enable row level security', t);
  end loop;
end $$;

-- Data publik (baca)
create policy pub_read_cities on cities for select using (true);
create policy pub_read_facilities on facilities for select using (true);
create policy pub_read_field_types on field_types for select using (true);
create policy pub_read_venues on venues for select using (status = 'aktif');
create policy pub_read_photos on venue_photos for select using (true);
create policy pub_read_venue_fac on venue_facilities for select using (true);
create policy pub_read_fields on fields for select using (status = 'aktif');
create policy pub_read_hours on field_operating_hours for select using (true);
create policy pub_read_price on field_price_rules for select using (true);
create policy pub_read_refund_rules on refund_rules for select using (true);
create policy pub_read_banners on banners for select using (is_active);
create policy pub_read_reviews on reviews for select using (is_visible);

-- Data milik sendiri
create policy own_profile on profiles for select using (id = auth.uid());
create policy own_bookings on bookings for select using (user_id = auth.uid());
create policy own_favorites on favorites for all using (user_id = auth.uid());
create policy own_notifications on notifications for select using (user_id = auth.uid());
create policy own_push on push_subscriptions for all using (user_id = auth.uid());
create policy own_chat_sessions on chat_sessions for select using (user_id = auth.uid());
create policy own_chat_messages on chat_messages for select
  using (session_id in (select id from chat_sessions where user_id = auth.uid()));
create policy own_tickets on tickets for select
  using (booking_id in (select id from bookings where user_id = auth.uid()));

-- Mitra: data usaha sendiri
create policy mitra_own_profile on mitra_profiles for select using (user_id = auth.uid());
create policy mitra_own_payouts on payouts for select
  using (mitra_id in (select id from mitra_profiles where user_id = auth.uid()));
create policy mitra_own_balance on mitra_balance_entries for select
  using (mitra_id in (select id from mitra_profiles where user_id = auth.uid()));

-- Admin: baca semua
create policy admin_all_profiles on profiles for select using (current_role_name() = 'admin');
create policy admin_all_mitra on mitra_profiles for select using (current_role_name() = 'admin');
create policy admin_all_bookings on bookings for select using (current_role_name() = 'admin');
create policy admin_all_payments on payments for select using (current_role_name() = 'admin');
create policy admin_all_audit on audit_logs for select using (current_role_name() = 'admin');
-- Tabel tanpa policy (payments non-admin, webhook_events, system_settings, dll.) hanya bisa lewat service role.
