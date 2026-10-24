# KelasHub — Minimalist 3D Academic Workspace

Dashboard kelas premium dengan efek 3D halus (CSS perspective + tilt + layered surfaces),
tema putih elegan ala Notion, typography Inter, dan data dari Supabase.

## Stack

- React 18 + TypeScript + Vite 5
- Tailwind CSS v4 (via @tailwindcss/vite)
- Lucide React (ikon)
- Supabase JS (autentikasi + data via RLS)
- Framer Motion TIDAK dipakai — semua animasi CSS transform/opacity (ringan)

## Menjalankan lokal

```bash
bun install          # atau npm install / yarn
bun run dev          # dev server
bun run build        # typecheck (tsc --noEmit) + production build
bun run preview      # serve hasil build
bun run lint         # eslint
bun run typecheck    # tsc --noEmit
```

> Catatan: `npm install` gagal di environment Windows tertentu (quirk path
> `\\?\` pada npm 11). Gunakan `bun install` — sudah teruji di sini.

## Koneksi Supabase

Salin `.env.example` → `.env`, lalu isi:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Tanpa keduanya, app berjalan dalam **Mode Demo**: seluruh angka statistik menampilkan
"—" dan setiap panel memberi label "Menunggu koneksi Supabase" — TIDAK ada angka dummy
yang berpura-pura data nyata.

### Tabel yang dibaca (semua via RLS user aktif)

| Tabel          | Field utama                                                       |
| -------------- | ----------------------------------------------------------------- |
| `schedules`    | course, day, start_time/time, room, lecturer, created_at          |
| `tasks`        | title, course, due_date, done/is_completed, created_at            |
| `materials`    | title/name, size, created_at                                      |
| `announcements`| title, body, pinned, created_at                                   |
| `members`      | name/full_name, email, status, created_at                         |
| `activity`     | text/action, created_at                                           |

Role diambil dari `auth.users.user_metadata.role`:
- `admin`   → tampil **Admin Dashboard** (statistik admin + quick actions).
- `student` → tampil **Student Dashboard** (jadwal hari ini, deadline, progres, materi).
- Menu administrasi tidak dirender untuk role selain admin.

### Praktik terbaik (disarankan, belum dibuat di repositori ini)

Schema SQL awal untuk Supabase — jalankan di SQL editor untuk membentuk struktur data:

```sql
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
  due_date timestamptz,
  done boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  size text,
  url text,
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
  name text,
  email text,
  status text default 'aktif',
  created_at timestamptz default now()
);

create table if not exists public.activity (
  id uuid primary key default gen_random_uuid(),
  text text,
  created_at timestamptz default now()
);

-- Aktifkan RLS pada tiap tabel lalu buat policy sesuai kebutuhan kelas.
alter table public.schedules enable row level security;
alter table public.tasks enable row level security;
alter table public.materials enable row level security;
alter table public.announcements enable row level security;
alter table public.members enable row level security;
alter table public.activity enable row level security;
```

## Struktur sumber

```
src/
  main.tsx
  App.tsx                 # shell: sidebar + topbar + routing ringan
  index.css               # tailwind, shadowns, animasi, reduced-motion
  lib/
    supabase.ts           # client + flag konfigurasi
    data.ts               # loadProfile, queryTable (RLS)
  hooks/
    useData.ts            # useTable, useProfile
    useTilt.tsx           # TiltProvider + useTilt (pointer→rotateX/Y/translateZ)
  components/
    TiltCard.tsx          # card 3D tilt/lift
    StatCard.tsx          # kartu statistik
    StatsGrid.tsx         # grid statistik admin/student
    Hero.tsx              # hero 3D (layered, float, tilt)
    ScheduleList.tsx      # jadwal berikutnya
    TaskList.tsx          # deadline tugas
    AnnouncementList.tsx  # pengumuman
    ActivityList.tsx      # aktivitas + materi cepat
    Section.tsx           # Section / Panel / EmptyHint
    Sidebar.tsx           # sidebar putih minimalis
    Topbar.tsx            # header + search + notif
  pages/
    DashboardPage.tsx     # dashboard mahasiswa
    AdminPage.tsx         # dashboard admin
    PlaceholderPage.tsx   # halaman menu lain (jadwal, tugas, dsb.)
```

## Accessibility & performance

- `prefers-reduced-motion: reduce` → semua animasi/nonaktif (floor ke 0.01ms), tilt dimatikan.
- Mobile (`hover:none`) → max tilt diturunkan; sidebar jadi drawer.
- Animasi hanya `transform` + `opacity` (GPU-friendly), float lambat 6–9s.
- Tidak ada video / model 3D berat; tidak ada horizontal overflow (diuji 390px).
- Semua kontrol interaktif keyboard-accessible (tombol asli, bukan div).