-- Data tamu contoh. Hapus / ganti lewat dashboard admin saat daftar tamu asli sudah siap.
insert into public.guests (slug, name, category, max_pax, phone) values
  ('budi-santoso', 'Bapak Budi Santoso & Keluarga', 'Keluarga', 4, '6281200000001'),
  ('siti-rahmawati', 'Ibu Siti Rahmawati', 'Keluarga', 2, null),
  ('dimas-pratama', 'Dimas Pratama', 'Teman Kuliah', 2, '6281200000003'),
  ('nabila-putri', 'Nabila Putri', 'Teman Kuliah', 1, null),
  ('rizky-maulana', 'Rizky Maulana & Partner', 'Teman Kantor', 2, '6281200000005'),
  ('ayu-lestari', 'Ayu Lestari', 'Teman Kantor', 1, null),
  ('h-ujang-sutisna', 'H. Ujang Sutisna', 'Tetangga', 3, null),
  ('euis-kurniasih', 'Euis Kurniasih', 'Tetangga', 2, null);

insert into public.rsvps (guest_id, name, attendance, pax, message)
select id, name, 'hadir', 2, 'Barakallahu lakuma wa baraka alaikuma wa jamaa bainakuma fii khair. Wilujeng nya!'
from public.guests where slug = 'dimas-pratama';

insert into public.rsvps (guest_id, name, attendance, pax, message)
select id, name, 'tidak_hadir', 0, 'Mohon maaf belum bisa hadir, semoga lancar sampai hari H dan menjadi keluarga sakinah mawaddah warahmah.'
from public.guests where slug = 'ayu-lestari';
