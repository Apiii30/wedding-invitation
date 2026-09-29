-- Skema undangan: daftar tamu + RSVP/ucapan.
--
-- Semua akses data lewat server Next.js memakai secret key (role service_role).
-- Browser tidak pernah menyentuh tabel ini secara langsung, jadi anon dan
-- authenticated tidak diberi akses sama sekali. RLS tetap aktif sebagai
-- lapisan pengaman tambahan.

create table public.guests (
  id bigint generated always as identity primary key,
  slug text not null unique check (slug ~ '^[a-z0-9-]{1,80}$'),
  name text not null check (char_length(name) between 1 and 120),
  category text check (char_length(category) <= 60),
  max_pax smallint not null default 2 check (max_pax between 1 and 20),
  phone text check (char_length(phone) <= 30),
  created_at timestamptz not null default now()
);

create table public.rsvps (
  id bigint generated always as identity primary key,
  -- null = tamu umum (link tanpa kode yang terdaftar)
  guest_id bigint unique references public.guests (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  attendance text not null check (attendance in ('hadir', 'tidak_hadir')),
  pax smallint not null default 0 check (pax between 0 and 20),
  message text check (char_length(message) <= 500),
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Daftar ucapan yang tampil di undangan (terbaru dulu).
create index rsvps_wishes_idx on public.rsvps (created_at desc)
  where message is not null and is_visible;

alter table public.guests enable row level security;
alter table public.rsvps enable row level security;

revoke all on public.guests, public.rsvps from anon, authenticated;
grant select, insert, update, delete on public.guests, public.rsvps to service_role;
