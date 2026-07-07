# 🚀 Deploy Plant Doctor AI ke Vercel

Estimasi: ~15 menit. Butuh akun **GitHub**, **Supabase**, **Vercel**, dan **Anthropic** (API key).

## 1. Siapkan Supabase
1. Buat project baru di [supabase.com](https://supabase.com).
2. **SQL Editor** → tempel & jalankan seluruh isi [`supabase/schema_normalized.sql`](supabase/schema_normalized.sql).
   Ini membuat tabel `users, plants, plant_photos, scans, diagnoses, treatments, reminders`,
   Row Level Security, trigger auto-sync `users` saat signup, dan bucket storage `plant-photos`.
3. **Project Settings → API**, catat:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key (rahasia) → `SUPABASE_SERVICE_ROLE_KEY`

## 2. Push kode ke GitHub
Dari folder project:
```bash
git init
git add -A
git commit -m "Plant Doctor AI"
git branch -M main
git remote add origin https://github.com/<username>/plant-doctor-ai.git
git push -u origin main
```
(File `.env.local` TIDAK ikut ter-commit karena sudah ada di `.gitignore`.)

## 3. Import ke Vercel
1. [vercel.com/new](https://vercel.com/new) → pilih repo `plant-doctor-ai`.
2. Framework: **Next.js** (terdeteksi otomatis). Build command & output default — biarkan.
3. **Environment Variables** — tambahkan semuanya (Production + Preview):

| Key | Nilai |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | dari Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | dari Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | dari Supabase (rahasia) |
| `ANTHROPIC_API_KEY` | dari console.anthropic.com |
| `ANTHROPIC_MODEL` | `claude-sonnet-4-5-20250929` (opsional) |
| `NEXT_PUBLIC_STORAGE_BUCKET` | `plant-photos` |
| `NEXT_PUBLIC_SITE_URL` | URL produksi, mis. `https://plant-doctor-ai.vercel.app` |

4. **Deploy**.

## 4. Setelah deploy
1. Salin URL produksi Vercel, isi ke env `NEXT_PUBLIC_SITE_URL` lalu **Redeploy** (agar QR code mengarah ke domain produksi).
2. Di Supabase: **Authentication → URL Configuration** → tambahkan URL Vercel ke **Site URL** dan **Redirect URLs**
   (mis. `https://plant-doctor-ai.vercel.app` dan `.../auth/callback`).
3. (Opsional) Matikan **Email confirmation** di Authentication → Providers → Email kalau ingin login langsung tanpa verifikasi saat testing.

## 5. Tes
- Buka domain → landing page muncul.
- **Daftar** akun → otomatis masuk dashboard (baris `users` dibuat oleh trigger).
- **Scan New Plant** → upload foto → hasil diagnosa tersimpan.
- Cek **Tanaman**, **Reminder**, **Settings → Export**.

## Catatan
- Endpoint `/api/scan` & `/compare` pakai Node runtime dengan `maxDuration` 60s — cocok untuk Vercel.
- Pastikan kuota Anthropic aktif (vision request menghabiskan token).
- Hasil AI adalah estimasi — bukan pengganti ahli tanaman.
