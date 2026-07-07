-- ============================================================
-- Plant Doctor AI — Normalized Database Schema (minimal)
-- Target: Supabase / PostgreSQL
-- Jalankan di Supabase Dashboard > SQL Editor.
--
-- Catatan: skema ini adalah desain ternormalisasi (users, plants,
-- plant_photos, scans, diagnoses, treatments, reminders). Berbeda
-- dari skema lama (schema.sql/_v2/_v3) yang dipakai aplikasi saat ini.
-- Pakai file ini bila ingin pindah ke struktur ternormalisasi.
-- ============================================================

create extension if not exists "pgcrypto";  -- untuk gen_random_uuid()

-- ------------------------------------------------------------
-- Trigger helper: updated_at
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================
-- USERS  (mirror dari auth.users)
-- ============================================================
create table if not exists public.users (
  id          uuid primary key references auth.users (id) on delete cascade,
  name        text,
  email       text,
  created_at  timestamptz not null default now()
);

-- Auto-insert baris users saat user baru mendaftar di auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- PLANTS
-- ============================================================
create table if not exists public.plants (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.users (id) on delete cascade,
  nickname            text,
  common_name         text,
  scientific_name     text,
  category            text,                 -- aroid | bonsai | sukulen | kaktus | orchid | indoor | outdoor | lainnya
  location            text,                 -- indoor | outdoor | bebas teks
  pot_size            text,                 -- mis. "15 cm", "1 gallon"
  growing_medium      text,
  watering_frequency  text,                 -- mis. "tiap 3 hari"
  fertilizer_schedule text,                 -- mis. "tiap 14 hari"
  light_condition     text,                 -- low | medium | bright | direct
  qr_code_url         text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

drop trigger if exists trg_plants_updated on public.plants;
create trigger trg_plants_updated
  before update on public.plants
  for each row execute function public.set_updated_at();

-- ============================================================
-- SCANS  (satu sesi analisa AI)
-- ============================================================
create table if not exists public.scans (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users (id) on delete cascade,
  plant_id        uuid references public.plants (id) on delete set null,  -- nullable
  status          text not null default 'pending'
                    check (status in ('pending', 'completed', 'failed')),
  ai_result_json  jsonb,
  health_score    integer check (health_score between 0 and 100),
  risk_level      text check (risk_level in ('low', 'medium', 'high', 'emergency')),
  summary         text,
  created_at      timestamptz not null default now()
);

-- ============================================================
-- PLANT_PHOTOS
-- ============================================================
create table if not exists public.plant_photos (
  id          uuid primary key default gen_random_uuid(),
  plant_id    uuid not null references public.plants (id) on delete cascade,
  scan_id     uuid references public.scans (id) on delete set null,  -- nullable
  photo_url   text not null,
  photo_type  text not null default 'other'
                check (photo_type in ('whole_plant', 'leaf', 'stem', 'root', 'soil', 'other')),
  uploaded_at timestamptz not null default now()
);

-- ============================================================
-- DIAGNOSES  (satu baris per masalah/penyebab dari sebuah scan)
-- ============================================================
create table if not exists public.diagnoses (
  id          uuid primary key default gen_random_uuid(),
  scan_id     uuid not null references public.scans (id) on delete cascade,
  plant_id    uuid references public.plants (id) on delete cascade,
  issue_name  text not null,
  issue_type  text,                 -- disease | pest | care_issue | environment | nutrition | natural_aging | unknown
  confidence  numeric,              -- 0..1 atau 0..100 (konsisten di aplikasi)
  severity    text,                 -- low | medium | high
  description text,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- TREATMENTS
-- ============================================================
create table if not exists public.treatments (
  id            uuid primary key default gen_random_uuid(),
  plant_id      uuid not null references public.plants (id) on delete cascade,
  scan_id       uuid references public.scans (id) on delete set null,
  title         text not null,
  instructions  text,
  status        text not null default 'pending'
                  check (status in ('pending', 'in_progress', 'completed')),
  due_date      date,
  completed_at  timestamptz,
  created_at    timestamptz not null default now()
);

-- ============================================================
-- REMINDERS
-- ============================================================
create table if not exists public.reminders (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.users (id) on delete cascade,
  plant_id      uuid references public.plants (id) on delete cascade,
  title         text not null,
  reminder_type text not null
                  check (reminder_type in ('watering', 'fertilizer', 'treatment', 'follow_up_scan')),
  due_date      date,
  repeat_rule   text,               -- mis. "FREQ=WEEKLY" / "every 3 days"
  is_done       boolean not null default false,
  created_at    timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Indexes (FK & query umum)
-- ------------------------------------------------------------
create index if not exists idx_plants_user        on public.plants (user_id);
create index if not exists idx_scans_user          on public.scans (user_id);
create index if not exists idx_scans_plant         on public.scans (plant_id);
create index if not exists idx_photos_plant        on public.plant_photos (plant_id);
create index if not exists idx_photos_scan         on public.plant_photos (scan_id);
create index if not exists idx_diagnoses_scan      on public.diagnoses (scan_id);
create index if not exists idx_diagnoses_plant     on public.diagnoses (plant_id);
create index if not exists idx_treatments_plant    on public.treatments (plant_id);
create index if not exists idx_treatments_scan     on public.treatments (scan_id);
create index if not exists idx_treatments_status   on public.treatments (status);
create index if not exists idx_reminders_user      on public.reminders (user_id);
create index if not exists idx_reminders_plant     on public.reminders (plant_id);
create index if not exists idx_reminders_due       on public.reminders (due_date) where is_done = false;

-- ============================================================
-- ROW LEVEL SECURITY
-- Setiap user hanya bisa mengakses datanya sendiri.
-- ============================================================
alter table public.users        enable row level security;
alter table public.plants       enable row level security;
alter table public.scans        enable row level security;
alter table public.plant_photos enable row level security;
alter table public.diagnoses    enable row level security;
alter table public.treatments   enable row level security;
alter table public.reminders    enable row level security;

-- USERS: hanya baris milik sendiri
drop policy if exists users_self on public.users;
create policy users_self on public.users
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- PLANTS: user_id langsung
drop policy if exists plants_own on public.plants;
create policy plants_own on public.plants
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- SCANS: user_id langsung
drop policy if exists scans_own on public.scans;
create policy scans_own on public.scans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- REMINDERS: user_id langsung
drop policy if exists reminders_own on public.reminders;
create policy reminders_own on public.reminders
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- PLANT_PHOTOS: kepemilikan via plant
drop policy if exists photos_own on public.plant_photos;
create policy photos_own on public.plant_photos
  for all
  using (exists (select 1 from public.plants p where p.id = plant_photos.plant_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.plants p where p.id = plant_photos.plant_id and p.user_id = auth.uid()));

-- DIAGNOSES: kepemilikan via scan
drop policy if exists diagnoses_own on public.diagnoses;
create policy diagnoses_own on public.diagnoses
  for all
  using (exists (select 1 from public.scans s where s.id = diagnoses.scan_id and s.user_id = auth.uid()))
  with check (exists (select 1 from public.scans s where s.id = diagnoses.scan_id and s.user_id = auth.uid()));

-- TREATMENTS: kepemilikan via plant
drop policy if exists treatments_own on public.treatments;
create policy treatments_own on public.treatments
  for all
  using (exists (select 1 from public.plants p where p.id = treatments.plant_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.plants p where p.id = treatments.plant_id and p.user_id = auth.uid()));

-- ============================================================
-- STORAGE: bucket foto tanaman
-- ============================================================
insert into storage.buckets (id, name, public)
values ('plant-photos', 'plant-photos', true)
on conflict (id) do nothing;

drop policy if exists photos_insert_own on storage.objects;
create policy photos_insert_own on storage.objects
  for insert with check (
    bucket_id = 'plant-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists photos_select_public on storage.objects;
create policy photos_select_public on storage.objects
  for select using (bucket_id = 'plant-photos');
