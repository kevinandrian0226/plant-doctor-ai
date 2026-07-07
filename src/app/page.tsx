import Link from "next/link";
import {
  Leaf, Camera, ScanSearch, Stethoscope, ListChecks, Sparkles, ArrowRight,
  HeartPulse, RefreshCw, QrCode, BellRing, Info, FileText,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const STEPS = [
  { icon: Camera, title: "Upload Foto", desc: "Ambil atau unggah 1–5 foto tanamanmu dari HP." },
  { icon: ScanSearch, title: "Deteksi Jenis", desc: "AI mengenali spesies, nama ilmiah & confidence." },
  { icon: Stethoscope, title: "Analisa Kesehatan", desc: "Penyakit, hama, dan masalah perawatan terdeteksi." },
  { icon: ListChecks, title: "Treatment", desc: "Rekomendasi aman + jadwal follow-up 3/7/14 hari." },
];
const FEATURES = [
  { icon: HeartPulse, title: "Health score & risk badge", desc: "Skor 0–100 dan tingkat risiko rendah hingga darurat." },
  { icon: RefreshCw, title: "Recovery tracker", desc: "Bandingkan foto sebelum & sesudah: membaik atau memburuk." },
  { icon: QrCode, title: "QR code per tanaman", desc: "Tempel di pot, scan untuk buka profil. Cocok untuk nursery." },
  { icon: BellRing, title: "Reminder treatment", desc: "Jadwal siram, pupuk & follow-up dengan kalender ringkas." },
  { icon: Leaf, title: "Aroid & Bonsai mode", desc: "Skor variegata, risiko browning, saran pruning & cahaya." },
  { icon: FileText, title: "Journal & PDF", desc: "Riwayat scan, foto & treatment. Unduh laporan PDF." },
];
const AUDIENCE = ["Aroid & Rare Monstera", "Philodendron", "Anthurium", "Aglaonema", "Bonsai", "Sukulen & Kaktus", "Indoor / Outdoor"];

export default async function LandingPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const ctaHref = user ? "/dashboard" : "/register";
  const ctaLabel = user ? "Buka Dashboard" : "Mulai Gratis";

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-charcoal">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-leaf-700 text-white shadow-soft"><Leaf className="h-5 w-5" /></span>
          <span className="text-lg font-bold">Plant Doctor AI</span>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <Link href="/dashboard" className="btn-primary">Dashboard</Link>
          ) : (
            <>
              <Link href="/login" className="hidden rounded-2xl px-4 py-2 text-sm font-semibold text-charcoal-light hover:text-leaf-700 sm:block dark:text-sage-200">Masuk</Link>
              <Link href="/register" className="btn-primary">Daftar</Link>
            </>
          )}
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="mx-4 rounded-[2rem] bg-gradient-to-br from-leaf-800 via-leaf-700 to-leaf-600 px-6 py-16 text-center text-white sm:py-20">
          <div className="pointer-events-none absolute inset-0 opacity-[0.13]" aria-hidden="true">
            <svg className="absolute -left-10 -top-8 h-64 w-64 -rotate-12" viewBox="0 0 100 100" fill="#fff"><path d="M50 5C25 25 15 55 30 90c5-30 20-55 45-70C62 28 52 45 48 70 60 50 70 30 50 5z" /></svg>
            <svg className="absolute -bottom-12 right-0 h-80 w-80 rotate-[24deg]" viewBox="0 0 100 100" fill="#fff"><path d="M50 5C25 25 15 55 30 90c5-30 20-55 45-70C62 28 52 45 48 70 60 50 70 30 50 5z" /></svg>
          </div>
          <div className="relative mx-auto max-w-3xl">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold text-leaf-50 ring-1 ring-white/20"><Sparkles className="h-3.5 w-3.5" /> Didukung AI Vision</span>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">Diagnosa kesehatan tanaman <span className="text-leaf-200">dari foto</span></h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-leaf-50/90">Dokter tanaman pribadi untuk kolektor premium. Deteksi jenis, kenali penyakit & hama, dan dapatkan rencana perawatan dalam hitungan detik.</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href={ctaHref} className="inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-3.5 text-base font-semibold text-leaf-800 transition hover:bg-leaf-50">{ctaLabel} <ArrowRight className="h-4 w-4" /></Link>
              {!user && <Link href="/login" className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-7 py-3.5 text-base font-semibold text-white ring-1 ring-white/25 transition hover:bg-white/25">Sudah punya akun</Link>}
            </div>
            <div className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-2">
              {AUDIENCE.map((a) => <span key={a} className="rounded-full bg-white/12 px-3 py-1 text-xs font-medium text-leaf-50 ring-1 ring-white/15">{a}</span>)}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <p className="eyebrow text-center">Cara kerja</p>
        <h2 className="mt-1 text-center text-3xl font-bold tracking-tight">Empat langkah sederhana</h2>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={i} className="card relative">
              <span className="absolute right-5 top-4 text-3xl font-extrabold text-leaf-50 dark:text-white/5">{i + 1}</span>
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-leaf-50 text-leaf-700 dark:bg-white/5"><s.icon className="h-6 w-6" /></span>
              <h3 className="mb-1 font-semibold">{s.title}</h3>
              <p className="text-sm text-charcoal-muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <p className="eyebrow text-center">Fitur</p>
        <h2 className="mt-1 text-center text-3xl font-bold tracking-tight">Semua yang kolektor butuhkan</h2>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div key={i} className="card">
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-leaf-50 text-leaf-700 dark:bg-white/5"><f.icon className="h-6 w-6" /></span>
              <h3 className="mb-1 font-semibold">{f.title}</h3>
              <p className="text-sm text-charcoal-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="flex flex-col items-center gap-6 rounded-[2rem] bg-leaf-700 p-10 text-center text-white sm:p-14">
          <RefreshCw className="h-10 w-10" />
          <h2 className="max-w-xl text-2xl font-bold tracking-tight">Lacak progress pemulihan setiap tanaman</h2>
          <p className="max-w-lg text-leaf-50/90">Simpan riwayat foto, diagnosis, dan grafik kesehatan dari waktu ke waktu — sempurna untuk kolektor, nursery, dan bonsai enthusiast.</p>
          <Link href={ctaHref} className="rounded-2xl bg-white px-7 py-3 text-sm font-semibold text-leaf-800 transition hover:bg-leaf-50">{ctaLabel}</Link>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 pb-16">
        <p className="flex items-start justify-center gap-2 text-center text-xs text-charcoal-muted">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Diagnosis bersifat estimasi berbasis foto, bukan pengganti pemeriksaan langsung oleh ahli tanaman. Untuk kondisi serius atau tanaman rare, konsultasikan ke nursery/ahli.
        </p>
      </section>

      <footer className="border-t border-black/5 py-8 text-center text-sm text-charcoal-muted dark:border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-5"><Leaf className="h-4 w-4 text-leaf-600" /> Plant Doctor AI — dibuat untuk para pecinta tanaman.</div>
      </footer>
    </div>
  );
}
