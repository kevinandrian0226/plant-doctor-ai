import Link from "next/link";
import {
  Leaf, Camera, ScanSearch, Stethoscope, ListChecks, Sparkles, ArrowRight,
  HeartPulse, RefreshCw, QrCode, BellRing, Info, FileText, Star, ShieldCheck,
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
const STATS = [
  { value: "1.200+", label: "Spesies dikenali" },
  { value: "30+", label: "Penyakit & hama" },
  { value: "< 15 dtk", label: "Per diagnosa" },
];

function LeafPattern() {
  return (
    <div className="pointer-events-none absolute inset-0 opacity-[0.13]" aria-hidden="true">
      <svg className="absolute -left-10 -top-8 h-64 w-64 -rotate-12" viewBox="0 0 100 100" fill="#fff"><path d="M50 5C25 25 15 55 30 90c5-30 20-55 45-70C62 28 52 45 48 70 60 50 70 30 50 5z" /></svg>
      <svg className="absolute -bottom-12 right-0 h-80 w-80 rotate-[24deg]" viewBox="0 0 100 100" fill="#fff"><path d="M50 5C25 25 15 55 30 90c5-30 20-55 45-70C62 28 52 45 48 70 60 50 70 30 50 5z" /></svg>
    </div>
  );
}

export default async function LandingPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const ctaHref = user ? "/dashboard" : "/register";
  const ctaLabel = user ? "Buka Dashboard" : "Mulai Gratis";

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-charcoal">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-leaf-700 text-white shadow-soft"><Leaf className="h-5 w-5" /></span>
          <span className="text-lg font-bold tracking-tight">Plant Doctor <span className="text-gold-600 dark:text-gold-300">AI</span></span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/explore" className="hidden rounded-2xl px-4 py-2 text-sm font-semibold text-charcoal-light hover:text-leaf-700 sm:block dark:text-sage-200">Explore</Link>
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

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="relative mx-4 overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-leaf-900 via-leaf-800 to-leaf-700 px-6 py-20 text-center text-white shadow-lift sm:py-28">
          <LeafPattern />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-300/50 to-transparent" aria-hidden="true" />
          <div className="relative mx-auto max-w-3xl">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-[0.14em] text-gold-100 ring-1 ring-gold-300/30 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-gold-300" /> DIDUKUNG AI VISION
            </span>
            <h1 className="display-title text-4xl leading-[1.08] sm:text-6xl">
              Dokter pribadi untuk<br className="hidden sm:block" /> tanaman <span className="italic text-gold-300">kesayanganmu</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-leaf-50/85 sm:text-lg">
              Cukup foto — AI mengenali jenis, mendeteksi penyakit &amp; hama, lalu menyusun rencana perawatan presisi. Dirancang untuk kolektor aroid, monstera langka, anthurium, dan bonsai.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href={ctaHref} className="btn-gold px-8 py-4 text-base">{ctaLabel} <ArrowRight className="h-4 w-4" /></Link>
              {!user && <Link href="/login" className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-8 py-4 text-base font-semibold text-white ring-1 ring-white/20 backdrop-blur transition hover:bg-white/20">Sudah punya akun</Link>}
            </div>
            <div className="mx-auto mt-14 grid max-w-lg grid-cols-3 gap-4 border-t border-white/10 pt-8">
              {STATS.map((s) => (
                <div key={s.label}>
                  <div className="display-title text-2xl text-gold-300 sm:text-3xl">{s.value}</div>
                  <div className="mt-1 text-[11px] uppercase tracking-wide text-leaf-50/70 sm:text-xs">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mx-auto -mt-6 flex max-w-3xl flex-wrap items-center justify-center gap-2 px-5">
          {AUDIENCE.map((a) => (
            <span key={a} className="rounded-full border border-gold-200/60 bg-white px-3.5 py-1.5 text-xs font-medium text-charcoal-light shadow-sm dark:border-gold-700/30 dark:bg-charcoal/60 dark:text-sage-200">{a}</span>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-6xl px-5 py-24">
        <div className="text-center">
          <span className="eyebrow-gold">Cara Kerja</span>
          <h2 className="display-title mt-3 text-3xl sm:text-4xl">Empat langkah sederhana</h2>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={i} className="card-lux group relative">
              <span className="absolute right-5 top-4 font-display text-4xl font-semibold text-leaf-50 transition-colors group-hover:text-gold-100 dark:text-white/5">{i + 1}</span>
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-leaf-50 text-leaf-700 ring-1 ring-leaf-100 dark:bg-white/5 dark:ring-white/10"><s.icon className="h-6 w-6" /></span>
              <h3 className="mb-1 font-semibold">{s.title}</h3>
              <p className="text-sm leading-relaxed text-charcoal-muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="text-center">
          <span className="eyebrow-gold">Fitur</span>
          <h2 className="display-title mt-3 text-3xl sm:text-4xl">Semua yang kolektor butuhkan</h2>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div key={i} className="card-lux">
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-leaf-50 text-leaf-700 ring-1 ring-leaf-100 dark:bg-white/5 dark:ring-white/10"><f.icon className="h-6 w-6" /></span>
              <h3 className="mb-1 font-semibold">{f.title}</h3>
              <p className="text-sm leading-relaxed text-charcoal-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIAL / TRUST */}
      <section className="mx-auto max-w-4xl px-5 pb-24">
        <div className="card-lux relative overflow-hidden text-center">
          <div className="mb-3 flex items-center justify-center gap-1 text-gold-400">
            {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
          </div>
          <p className="display-title mx-auto max-w-2xl text-xl leading-snug sm:text-2xl">
            &ldquo;Variegata Thai Constellation-ku hampir busuk akar. Plant Doctor mendeteksinya lebih cepat dari mata saya, dan panduan treatment-nya menyelamatkannya.&rdquo;
          </p>
          <div className="mt-5 flex items-center justify-center gap-2 text-sm text-charcoal-muted">
            <ShieldCheck className="h-4 w-4 text-leaf-600" /> Kolektor aroid, Jakarta
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="relative flex flex-col items-center gap-6 overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-leaf-800 to-leaf-700 p-12 text-center text-white shadow-lift sm:p-16">
          <LeafPattern />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-300/50 to-transparent" aria-hidden="true" />
          <div className="relative flex flex-col items-center gap-6">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-gold-300/30"><RefreshCw className="h-7 w-7 text-gold-300" /></span>
            <h2 className="display-title max-w-xl text-2xl sm:text-3xl">Lacak progress pemulihan setiap tanaman</h2>
            <p className="max-w-lg leading-relaxed text-leaf-50/85">Simpan riwayat foto, diagnosis, dan grafik kesehatan dari waktu ke waktu — sempurna untuk kolektor, nursery, dan bonsai enthusiast.</p>
            <Link href={ctaHref} className="btn-gold px-8 py-3.5">{ctaLabel} <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 pb-16">
        <p className="flex items-start justify-center gap-2 text-center text-xs leading-relaxed text-charcoal-muted">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Diagnosis bersifat estimasi berbasis foto, bukan pengganti pemeriksaan langsung oleh ahli tanaman. Untuk kondisi serius atau tanaman rare, konsultasikan ke nursery/ahli.
        </p>
      </section>

      <footer className="border-t border-black/5 py-8 text-center text-sm text-charcoal-muted dark:border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-3 px-5">
          <div className="flex items-center gap-2"><Leaf className="h-4 w-4 text-leaf-600" /> Plant Doctor AI — dibuat untuk para pecinta tanaman.</div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs">
            <Link href="/privasi" className="hover:text-leaf-600">Kebijakan Privasi</Link>
            <span className="text-charcoal-muted/40">•</span>
            <Link href="/ketentuan" className="hover:text-leaf-600">Syarat &amp; Ketentuan</Link>
            <span className="text-charcoal-muted/40">•</span>
            <Link href="/explore" className="hover:text-leaf-600">Explore</Link>
            <span className="text-charcoal-muted/40">•</span>
            <Link href="/market" className="hover:text-leaf-600">Marketplace</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
