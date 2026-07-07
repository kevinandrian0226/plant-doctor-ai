# 🌿 Plant Doctor AI

Aplikasi web untuk **mendeteksi jenis tanaman dan kemungkinan penyakit/stress hanya dari foto**, lengkap dengan rekomendasi treatment step-by-step dan pelacakan progress pemulihan. Ditujukan untuk penghobi tanaman hias premium: aroid, rare monstera, philodendron, anthurium, aglaonema, bonsai, sukulen, kaktus, serta tanaman indoor/outdoor lainnya.

## ✨ Fitur

- 📊 **Dashboard** — ringkasan jumlah tanaman, jumlah sehat, jumlah perlu perhatian, diagnosis terakhir, reminder treatment, dan tombol **Scan Tanaman Baru**
- 📸 **Multi-foto scan** — unggah foto seluruh tanaman, daun close-up, batang/petiol, media tanam, dan akar dalam satu analisa
- 🔍 **Deteksi jenis** — nama umum, nama ilmiah, kategori (aroid, bonsai, sukulen, kaktus, orchid, indoor/outdoor, dll), confidence score, dan catatan jika tidak yakin
- 🐛 **Deteksi penyakit/stress/hama** — fungal & bacterial leaf spot, root/stem rot, over/underwatering, sunburn, low humidity, defisiensi nutrisi, fertilizer burn, thrips, spider mites, mealybug, scale insect, leaf yellowing, browning variegation, hingga penuaan daun normal
- 📋 **Treatment lengkap** — tingkat risiko (rendah→darurat), langkah pertama, perlu isolasi/potong daun/cek akar, perbaikan media/penyiraman/cahaya/airflow, rekomendasi produk aman, **jadwal follow-up 3/7/14 hari**, dan peringatan konsultasi ahli
- 📔 **Plant Journal** — profil tanaman (nama, jenis, tanggal masuk koleksi, lokasi, media, jadwal siram & pupuk), foto berkala, riwayat diagnosis & treatment
- 🔳 **QR Code per tanaman** — scan untuk buka halaman detail; bisa diunduh & dicetak untuk koleksi/nursery
- 🧭 **Flow scan terpandu** — upload 1–5 foto → isi data opsional (lokasi indoor/outdoor, frekuensi siram, media tanam, terakhir dipupuk, kondisi cahaya) → *Analyze* → report; konteks dikirim ke AI agar diagnosa lebih akurat
- 📄 **Download report PDF** — laporan diagnosa lengkap diunduh sebagai PDF (jsPDF)
- 🔄 **Recovery Tracker** — unggah foto follow-up, AI membandingkan kondisi (membaik/stabil/memburuk/butuh tindakan)
- 🪴 **Aroid Special Mode** — skor kesehatan variegata, risiko browning area putih, proporsi area putih, rekomendasi cahaya, peringatan overwatering
- 🎍 **Bonsai Special Mode** — daun menguning, kekeringan, jamur batang/media, akar terlalu basah, kutu, saran pruning & posisi cahaya
- 🔔 **Reminder treatment** in-app (jadwal siram, pupuk, follow-up) dengan tombol tandai selesai
- 🔐 **Autentikasi** email/password (siap ditambah Google Login)
- 🌗 **Dark/light mode**, mobile-first, card-based UI premium

## 🧱 Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | Next.js API Routes + Server Actions |
| Database | Supabase PostgreSQL (dengan Row Level Security) |
| Storage | Supabase Storage |
| Auth | Supabase Auth (email/password, siap Google OAuth) |
| AI Vision | Anthropic Claude (output JSON terstruktur) |
| Deploy | Vercel |

## 🚀 Setup Lokal

### 1. Install dependencies

```bash
npm install
```

### 2. Siapkan Supabase

1. Buat project di [supabase.com](https://supabase.com).
2. Buka **SQL Editor**, jalankan isi file [`supabase/schema_normalized.sql`](supabase/schema_normalized.sql). Ini membuat tabel ternormalisasi (`users`, `plants`, `plant_photos`, `scans`, `diagnoses`, `treatments`, `reminders`), Row Level Security, trigger auto-sync `users` saat signup, dan bucket storage `plant-photos`. **Skema inilah yang dipakai aplikasi sekarang** (file `schema.sql`/`_v2`/`_v3` lama tidak lagi dipakai).
3. Buka **Project Settings → API** untuk mengambil URL & key.

### 3. Konfigurasi environment

Salin `.env.example` menjadi `.env.local` lalu isi:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...           # rahasia, server-only
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-sonnet-4-5-20250929 # opsional
NEXT_PUBLIC_STORAGE_BUCKET=plant-photos
```

> 🔑 `ANTHROPIC_API_KEY` didapat dari [console.anthropic.com](https://console.anthropic.com).

### 4. Jalankan

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## 📁 Struktur Project

```
src/
├── app/
│   ├── (auth)/              # login, register, server actions auth
│   ├── (app)/              # area terproteksi (dashboard, diagnose, history)
│   ├── api/
│   │   ├── diagnose/       # endpoint AI: upload + analisa + simpan
│   │   └── plants/[id]/    # update/hapus tanaman
│   ├── auth/callback/ 