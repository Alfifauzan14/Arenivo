-- =====================================================================
-- 0001_schema.sql — Skema inti Aplikasi Booking Lapangan (PRD Bab 6.1)
-- Uang = integer Rupiah, waktu = timestamptz, PK = uuid
-- =====================================================================
create extension if not exists "pgcrypto";

-- ---------- Enum ----------
create type user_role as enum ('penyewa','mitra','admin');
create type account_status as enum ('aktif','diblokir');
create type verification_status as enum ('menunggu','disetujui','ditolak');
create type venue_status as enum ('aktif','nonaktif','diblokir');
create type field_status as enum ('aktif','nonaktif');
create type reservation_type as enum ('booking','blokir');
create type booking_source as enum ('online','manual');
create type booking_status as enum ('menunggu_bayar','dikonfirmasi','digunakan','selesai','kedaluwarsa','dibatalkan');
create type payment_status as enum ('pending','berhasil','gagal','kedaluwarsa');
create type ticket_status as enum ('aktif','digunakan','dibatalkan');
create type scan_result as enum ('sah','sudah_dipakai','belum_dibayar','salah_waktu','salah_venue','dibatalkan','tidak_ditemukan');
create type refund_status as enum ('diajukan','disetujui','diproses','selesai','ditolak');
create type payout_status as enum ('menunggu','disetujui','diproses','selesai','ditolak');

-- ---------- Trigger updated_at ----------
create or replace function set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- ---------- Identitas ----------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null,
  phone text,
  avatar_url text,
  role user_role not null default 'penyewa',
  status account_status not null default 'aktif',
  tiktok_open_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table mitra_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references profiles(id) on delete cascade,
  business_name text not null,
  business_address text,
  document_url text,
  verification_status verification_status not null default 'menunggu',
  rejection_reason text,
  verified_by uuid references profiles(id),
  verified_at timestamptz,
  bank_name text,
  bank_account_number text,
  bank_account_holder text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Master data ----------
create table cities (
  id uuid primary key default gen_random_uuid(),
  name text not null, province text not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table facilities (
  id uuid primary key default gen_random_uuid(),
  name text not null, icon text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table field_types (
  id uuid primary key default gen_random_uuid(),
  code text not null unique, name text not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

-- ---------- Venue & lapangan ----------
create table venues (
  id uuid primary key default gen_random_uuid(),
  mitra_id uuid not null references mitra_profiles(id) on delete cascade,
  city_id uuid not null references cities(id),
  name text not null,
  slug text not null unique,
  description text,
  address text not null,
  latitude double precision,
  longitude double precision,
  youtube_url text,
  rules text,
  status venue_status not null default 'aktif',
  rating_avg numeric(3,2) not null default 0,
  review_count integer not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index venues_city_idx on venues(city_id);
create index venues_mitra_idx on venues(mitra_id);

create table venue_photos (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references venues(id) on delete cascade,
  url text not null, sort_order integer not null default 0, is_cover boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table venue_facilities (
  venue_id uuid not null references venues(id) on delete cascade,
  facility_id uuid not null references facilities(id) on delete cascade,
  primary key (venue_id, facility_id)
);

create table fields (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references venues(id) on delete cascade,
  field_type_id uuid not null references field_types(id),
  name text not null, size_description text, surface text,
  base_price integer not null check (base_price >= 0),
  status field_status not null default 'aktif',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index fields_venue_idx on fields(venue_id);

create table field_operating_hours (
  id uuid primary key default gen_random_uuid(),
  field_id uuid not null references fields(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  open_time time not null, close_time time not null,
  is_closed boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (field_id, day_of_week)
);
create table field_price_rules (
  id uuid primary key default gen_random_uuid(),
  field_id uuid not null references fields(id) on delete cascade,
  day_of_week smallint check (day_of_week between 0 and 6),
  start_time time not null, end_time time not null,
  price integer not null check (price >= 0),
  priority integer not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table refund_rules (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid references venues(id) on delete cascade, -- null = default global
  min_hours_before integer not null check (min_hours_before >= 0),
  refund_percent integer not null check (refund_percent between 0 and 100),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

-- ---------- Promo (dibuat sebelum bookings agar bisa direferensi) ----------
create table promos (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid references venues(id) on delete cascade, -- null = promo global (ditanggung platform)
  code text not null unique,
  discount_type text not null check (discount_type in ('fixed','percent')),
  discount_value integer not null check (discount_value > 0),
  max_discount integer,
  min_spend integer not null default 0,
  quota integer not null default 0,
  used_count integer not null default 0,
  start_date timestamptz not null default now(),
  end_date timestamptz not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

-- ---------- Booking & slot ----------
create table bookings (
  id uuid primary key default gen_random_uuid(),
  booking_code text not null unique,
  user_id uuid references profiles(id),
  customer_name text not null, customer_phone text not null,
  field_id uuid not null references fields(id),
  venue_id uuid not null references venues(id),
  play_start timestamptz not null, play_end timestamptz not null,
  total_hours integer not null check (total_hours >= 1),
  source booking_source not null default 'online',
  status booking_status not null default 'menunggu_bayar',
  subtotal integer not null default 0, service_fee integer not null default 0,
  discount integer not null default 0, total_price integer not null default 0,
  commission_rate numeric(5,4) not null default 0.10,
  platform_commission integer not null default 0, mitra_amount integer not null default 0,
  promo_id uuid references promos(id), promo_is_global boolean not null default false,
  expires_at timestamptz, notes text,
  cancelled_by uuid references profiles(id), cancelled_at timestamptz, cancel_reason text,
  reschedule_count integer not null default 0,
  idempotency_key text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create unique index bookings_idem_uniq on bookings(user_id, idempotency_key) where idempotency_key is not null;
create index bookings_user_idx on bookings(user_id);
create index bookings_venue_idx on bookings(venue_id, play_start);
create index bookings_status_idx on bookings(status);

create table slot_reservations (
  id uuid primary key default gen_random_uuid(),
  field_id uuid not null references fields(id) on delete cascade,
  slot_start timestamptz not null, slot_end timestamptz not null,
  type reservation_type not null,
  booking_id uuid references bookings(id) on delete cascade,
  price integer not null default 0, reason text,
  created_by uuid references profiles(id),
  is_active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
-- Pencegah double booking (PRD 4.3)
create unique index slot_reservations_active_uniq on slot_reservations(field_id, slot_start) where is_active = true;

-- ---------- Pembayaran, tiket, refund ----------
create table payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  midtrans_order_id text not null unique,
  midtrans_transaction_id text,
  payment_type text,
  gross_amount integer not null,
  status payment_status not null default 'pending',
  snap_token text, paid_at timestamptz, raw_notification jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table webhook_events (
  id uuid primary key default gen_random_uuid(),
  event_key text not null unique, payload jsonb, processed boolean not null default false,
  created_at timestamptz not null default now()
);
create table tickets (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references bookings(id) on delete cascade,
  ticket_code text not null unique,
  status ticket_status not null default 'aktif',
  issued_at timestamptz not null default now(), used_at timestamptz,
  checked_in_by uuid references profiles(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table ticket_scans (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid references tickets(id) on delete set null,
  scanned_code text not null,
  venue_id uuid references venues(id),
  scanned_by uuid references profiles(id),
  result scan_result not null,
  scanned_at timestamptz not null default now()
);
create table refunds (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  payment_id uuid references payments(id),
  amount integer not null, refund_percent integer not null,
  status refund_status not null default 'diajukan',
  reason text, rejection_reason text, midtrans_refund_key text,
  requested_by uuid references profiles(id), processed_by uuid references profiles(id),
  processed_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

-- ---------- Keuangan mitra ----------
create table mitra_balance_entries (
  id uuid primary key default gen_random_uuid(),
  mitra_id uuid not null references mitra_profiles(id) on delete cascade,
  booking_id uuid references bookings(id),
  payout_id uuid, -- FK ditambahkan setelah tabel payouts
  amount integer not null, -- plus = pemasukan, minus = pencairan
  description text,
  created_at timestamptz not null default now()
);
create table payouts (
  id uuid primary key default gen_random_uuid(),
  mitra_id uuid not null references mitra_profiles(id) on delete cascade,
  amount integer not null check (amount > 0),
  bank_name text not null, bank_account_number text not null, bank_account_holder text not null,
  status payout_status not null default 'menunggu',
  rejection_reason text, transfer_reference text,
  processed_by uuid references profiles(id), processed_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table mitra_balance_entries add constraint mbe_payout_fk foreign key (payout_id) references payouts(id);

create view mitra_balances as
select
  mp.id as mitra_id,
  coalesce(sum(e.amount),0)::integer as saldo_total,
  coalesce((select sum(p.amount) from payouts p where p.mitra_id = mp.id and p.status in ('menunggu','disetujui','diproses')),0)::integer as saldo_tertahan,
  (coalesce(sum(e.amount),0) - coalesce((select sum(p.amount) from payouts p where p.mitra_id = mp.id and p.status in ('menunggu','disetujui','diproses')),0))::integer as saldo_bisa_dicairkan
from mitra_profiles mp
left join mitra_balance_entries e on e.mitra_id = mp.id
group by mp.id;
-- Catatan: payout menunggu/disetujui/diproses belum menulis entri minus; entri minus ditulis saat payout 'selesai'.

-- ---------- Konten, notifikasi, sistem ----------
create table reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references bookings(id) on delete cascade,
  venue_id uuid not null references venues(id) on delete cascade,
  user_id uuid not null references profiles(id),
  rating smallint not null check (rating between 1 and 5),
  comment text, reply text, replied_at timestamptz,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table favorites (
  user_id uuid not null references profiles(id) on delete cascade,
  venue_id uuid not null references venues(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, venue_id)
);
create table banners (
  id uuid primary key default gen_random_uuid(),
  title text not null, image_url text not null, link_url text,
  sort_order integer not null default 0, is_active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null, body text, data jsonb, is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  token text not null unique,
  created_at timestamptz not null default now()
);
create table chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references chat_sessions(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz not null default now()
);
create table system_settings (
  key text primary key,
  value jsonb not null,
  updated_by uuid references profiles(id),
  updated_at timestamptz not null default now()
);
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references profiles(id),
  action text not null, target_type text, target_id text, details text, ip_address text,
  created_at timestamptz not null default now()
);

-- ---------- Trigger updated_at untuk semua tabel yang punya kolomnya ----------
do $$
declare t text;
begin
  for t in select table_name from information_schema.columns
           where table_schema='public' and column_name='updated_at'
             and table_name in (select table_name from information_schema.tables where table_type='BASE TABLE')
  loop
    execute format('create trigger trg_%I_updated before update on %I for each row execute function set_updated_at()', t, t);
  end loop;
end $$;

-- ---------- Seed default ----------
insert into system_settings(key,value) values
 ('booking_expiration_minutes','15'),('max_booking_days_ahead','30'),
 ('default_platform_commission_percent','10'),('default_service_fee_rupiah','5000'),
 ('min_payout_amount_rupiah','100000'),('scanner_early_checkin_minutes','30'),
 ('primary_ai_provider','"gemini"');

insert into refund_rules(venue_id,min_hours_before,refund_percent) values
 (null,24,100),(null,6,50),(null,0,0);
