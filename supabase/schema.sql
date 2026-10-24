-- ============================================================
-- KelasHub — Schema + Row Level Security
-- Project: https://ilkioyuyxhryfeaujuyq.supabase.co
-- Jalankan SELURUH file ini di SQL Editor (Dashboard → SQL Editor → New query → RUN)
-- ============================================================

-- ---------- TABEL ----------

create table if not exists public.schedules (
  id uuid primary key default gen_random_uuid(),
  course text not null,
  day text,
  start_time text,
  end_time text,
  room text,
  lecturer text,
  created_at timestamptz default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  course text,
  due_date date,
  done boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  size text,
  url text,
  file text,
  file_name text,
  file_url text,
  file_path text,
  created_at timestamptz default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  pinned boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  nim text,
  name text,
  email text,
  status text default 'aktif',
  created_at timestamptz default now()
);

create table if not exists public.activity (
  id uuid primary key default gen_random_uuid(),
  text text,
  action text,
  created_at timestamptz default now()
);

-- ---------- ROW LEVEL SECURITY ----------

alter table public.schedules enable row level security;
alter table public.tasks enable row level security;
alter table public.materials enable row level security;
alter table public.announcements enable row level security;
alter table public.members enable row level security;
alter table public.activity enable row level security;

-- ---------- POLICY ----------
-- Catatan: untuk project kelas skala kecil ini, policy dibuka untuk
-- anon + authenticated agar app bisa baca/tulis lewat publishable key
-- tanpa harus login Supabase. Kalau butuh lebih ketat (writes hanya
-- untuk role admin terautentikasi), ganti bagian bawah dengan policy
-- `authenticated`.

do $$
declare t text;
begin
  foreach t in array array['schedules','tasks','materials','announcements','members','activity']
  loop
    execute format('drop policy if exists "baca" on public.%I', t);
    execute format('drop policy if exists "tulis" on public.%I', t);
    execute format('create policy "baca" on public.%I for select using (true)', t);
    execute format('create policy "tulis" on public.%I for insert with check (true)', t);
    execute format('create policy "ubah" on public.%I for update using (true)', t);
    execute format('create policy "hapus" on public.%I for delete using (true)', t);
  end loop;
end $$;

-- ---------- SEED DATA AWAL ----------

insert into public.schedules (course, day, start_time, end_time, room, lecturer) values
  ('Sistem Informasi', 'Senin', '10:00', '11:40', 'A-204', 'Dosen SI'),
  ('Basis Data', 'Selasa', '08:00', '09:40', 'Lab Komputer 2', 'Dosen BD'),
  ('Algoritma & Pemrograman', 'Rabu', '13:00', '14:40', 'A-101', 'Dosen Algo'),
  ('Kewarganegaraan', 'Kamis', '09:00', '10:40', 'B-302', 'Dosen KN'),
  ('Bahasa Inggris', 'Jumat', '08:00', '09:40', 'A-201', 'Dosen BI');

insert into public.tasks (title, course, due_date, done) values
  ('Tugas 5 — Pancasila', 'Pendidikan Pancasila', current_date + 3, false),
  ('Laporan Praktikum Basis Data', 'Basis Data', current_date + 2, false),
  ('Presentasi Sistem Informasi', 'Sistem Informasi', current_date + 6, false),
  ('Rangkuman Algoritma', 'Algoritma & Pemrograman', current_date - 1, true);

insert into public.materials (title, size) values
  ('Modul Algoritma & Struktur Data', 'PDF'),
  ('Slide Konsep Basis Data', 'PPT'),
  ('Latihan Soal Pemrograman', 'PDF'),
  ('Materi Present Tense', 'PPT');

insert into public.announcements (title, body, pinned) values
  ('Perubahan jadwal kuliah minggu depan', 'Kuliah Basis Data Selasa dipindah ke Lab Komputer 1. Perhatikan jadwal terbaru di halaman Jadwal.', true),
  ('Kumpul Tugas 5 paling lambat Jumat', 'Tugas 5 Pancasila dikumpulkan dalam format PDF melalui halaman Tugas.', false),
  ('Kuliah tambahan hari Sabtu', 'Akan ada sesi konsultasi tambahan pukul 10.00 di Ruang A-101.', false);

insert into public.activity (text) values
  ('Revan Krestian mengumpulkan Rangkuman Algoritma.'),
  ('Admin memposting pengumuman baru.'),
  ('Materi Latihan Soal Pemrograman ditambahkan.'),
  ('Jadwal kuliah diperbarui.');

-- ---------- SELESAI ----------
-- Setelah menjalankan file ini, jalankan juga file "seed_members.sql"
-- untuk mengisi 36 mahasiswa dari data kehadiran.