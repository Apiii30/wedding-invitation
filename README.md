# Undangan Pernikahan Frisca & Arif

Undangan digital (Next.js + Tailwind + Supabase) dengan link personal per tamu, RSVP, ucapan, amplop digital, dan dashboard admin.

## Menjalankan di komputer

```bash
npm install
npm run dev
```

- Undangan: http://localhost:3000/?to=budi-santoso
- Dashboard: http://localhost:3000/admin

Tanpa `.env.local`, aplikasi berjalan dalam **mode demo**: memakai data tamu contoh yang disimpan di memori (hilang saat server dimatikan), dan dashboard bisa dibuka tanpa login.

## Mengubah isi undangan

Semua teks ada di [`src/data/wedding.ts`](src/data/wedding.ts): nama, orang tua, tanggal, lokasi, link Google Maps, rekening, dan pilihan foto. Bagian bertanda `TODO` masih berisi data sementara.

- **Musik:** simpan file lagu sebagai `public/music/backsound.mp3`. Tombol musik otomatis tersembunyi jika file belum ada.
- **Foto:** foto asli disimpan di folder `wedding/` (tidak ikut di-deploy). Setelah menambah atau mengganti foto, jalankan `npm run images` untuk membuat versi WebP di `public/images/`, lalu pilih ID fotonya (misal `dsc00273`) di `wedding.ts`.

## Link tamu

| Link | Perilaku |
|---|---|
| `/?to=budi-santoso` | Tamu terdaftar: nama rapi, jumlah kursi sesuai jatah, dan RSVP bisa diubah |
| `/?to=Budi Santoso` | Tamu umum: nama ditampilkan apa adanya, RSVP dicatat sebagai tamu umum |
| `/` | Tanpa nama: "Tamu Undangan" |

Tamu terdaftar dikelola di dashboard. Tamu bisa ditempel langsung dari Excel dengan kolom `Nama | Kategori | Jatah | No HP`. Tombol **WA** membuka WhatsApp berisi pesan undangan beserta link personalnya.

## Menghubungkan Supabase

1. Buat project di [supabase.com](https://supabase.com).
2. Jalankan skema database. Pilih salah satu:
   - Buka **SQL Editor**, lalu jalankan isi `supabase/migrations/*_init_invitation.sql` (dan `supabase/seed.sql` jika ingin data contoh), **atau**
   - Jalankan `npx supabase link` lalu `npx supabase db push`.
3. **Authentication → Sign In / Providers:** matikan *Allow new users to sign up*.
4. **Authentication → Users → Add user:** buat akun (email + password) untuk kamu dan pasangan. Centang *Auto Confirm User*.
5. Salin `.env.example` menjadi `.env.local`, lalu isi:
   - `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: dari **Project Settings → API Keys**
   - `SUPABASE_SECRET_KEY`: secret key (rahasia, jangan dibagikan)
   - `ADMIN_EMAILS`: email kalian berdua, dipisahkan koma
6. Restart `npm run dev`, lalu login di `/admin`.

Semua akses database lewat server. Browser tidak pernah memegang secret key, dan tabel tertutup untuk akses publik (RLS aktif, tanpa grant ke `anon`/`authenticated`).

## Deploy ke Vercel

1. Push project ke GitHub, lalu import di [vercel.com](https://vercel.com).
2. Isi Environment Variables yang sama seperti `.env.local`. Isi juga `NEXT_PUBLIC_SITE_URL` dengan alamat undangan (misal `https://frisca-arif.vercel.app`).
3. Deploy.

## Perintah

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Server development |
| `npm run build` | Build production |
| `npm run images` | Konversi foto di `wedding/` menjadi WebP |
| `npm run typecheck` / `npm run lint` | Pemeriksaan kode |
