import type { Metadata } from "next";
import Link from "next/link";
import { Leaf, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan | Plant Doctor AI",
  description: "Ketentuan penggunaan layanan Plant Doctor AI.",
};

const UPDATED = "10 Juli 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="display-title text-xl">{title}</h2>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-charcoal-light dark:text-sage-200">{children}</div>
    </section>
  );
}

export default function KetentuanPage() {
  return (
    <div className="min-h-screen bg-cream-100 dark:bg-charcoal">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-leaf-700 text-white shadow-soft ring-1 ring-gold-300/30"><Leaf className="h-5 w-5" /></span>
          <span className="text-lg font-bold tracking-tight">Plant Doctor <span className="text-gold-600 dark:text-gold-300">AI</span></span>
        </Link>
        <Link href="/" className="btn-secondary"><ArrowLeft className="h-4 w-4" /> Beranda</Link>
      </header>

      <main className="mx-auto max-w-3xl px-5 pb-24">
        <span className="eyebrow-gold">Legal</span>
        <h1 className="display-title mt-3 text-3xl sm:text-4xl">Syarat &amp; Ketentuan</h1>
        <p className="mt-2 text-sm text-charcoal-muted">Terakhir diperbarui: {UPDATED}</p>

        <p className="mt-6 text-sm leading-relaxed text-charcoal-light dark:text-sage-200">
          Dengan membuat akun atau memakai Plant Doctor AI, kamu menyetujui ketentuan berikut. Mohon baca dengan saksama.
        </p>

        <Section title="1. Tentang layanan">
          <p>Plant Doctor AI membantu mendeteksi jenis tanaman dan kemungkinan penyakit/stress dari foto, memberi rekomendasi perawatan, serta menyediakan katalog publik dan marketplace antar-kolektor.</p>
        </Section>

        <Section title="2. Diagnosis bersifat estimasi">
          <p>Hasil analisis AI adalah <strong>estimasi berbasis foto</strong>, bukan pengganti pemeriksaan langsung oleh ahli tanaman, agronom, atau dokter tanaman profesional. Keputusan perawatan sepenuhnya menjadi tanggung jawab kamu. Untuk kondisi serius atau tanaman rare bernilai tinggi, konsultasikan ke ahli.</p>
        </Section>

        <Section title="3. Akun kamu">
          <p>Kamu bertanggung jawab menjaga kerahasiaan akun dan seluruh aktivitas di dalamnya. Berikan informasi yang benar saat mendaftar.</p>
        </Section>

        <Section title="4. Konten kamu">
          <p>Foto dan data tanaman tetap milikmu. Dengan menandai konten sebagai publik (halaman tanaman, profil, atau listing), kamu memberi kami izin untuk menampilkannya kepada pengguna lain di dalam aplikasi. Jangan mengunggah konten yang melanggar hukum, menyesatkan, atau melanggar hak orang lain.</p>
        </Section>

        <Section title="5. Marketplace antar-pengguna">
          <p>Marketplace hanya mempertemukan penjual dan pembeli. <strong>Kami tidak memproses pembayaran, tidak menyimpan dana, dan tidak menjadi pihak dalam transaksi apa pun.</strong> Seluruh negosiasi, pembayaran, pengiriman, dan penyelesaian sengketa dilakukan langsung antara penjual dan pembeli (mis. via WhatsApp). Kami tidak bertanggung jawab atas kualitas tanaman, keaslian, keterlambatan, atau kerugian dari transaksi. Berhati-hatilah dan verifikasi penjual sebelum bertransaksi.</p>
        </Section>

        <Section title="6. Layanan konsultasi">
          <p>Permintaan konsultasi ahli diproses secara upaya-terbaik (best effort) dan bukan layanan darurat. Waktu respon dapat bervariasi.</p>
        </Section>

        <Section title="7. Hal yang dilarang">
          <p>Dilarang menyalahgunakan layanan, mencoba meretas atau mengakses data pengguna lain, mengunggah malware, melakukan spam, atau memakai layanan untuk tujuan melanggar hukum.</p>
        </Section>

        <Section title="8. Batasan tanggung jawab">
          <p>Layanan disediakan &ldquo;sebagaimana adanya&rdquo; tanpa jaminan apa pun. Sejauh diizinkan hukum, kami tidak bertanggung jawab atas kerugian yang timbul dari penggunaan layanan, termasuk kerusakan atau kematian tanaman dan kerugian dari transaksi marketplace.</p>
        </Section>

        <Section title="9. Perubahan & penghentian">
          <p>Kami dapat memperbarui fitur atau ketentuan ini sewaktu-waktu, dan dapat menangguhkan akun yang melanggar ketentuan.</p>
        </Section>

        <Section title="10. Hukum yang berlaku">
          <p>Ketentuan ini tunduk pada hukum Republik Indonesia.</p>
        </Section>

        <Section title="11. Kontak">
          <p>Pertanyaan? Hubungi <a href="mailto:kevinandrian0226@gmail.com" className="font-medium text-leaf-700 underline dark:text-leaf-300">kevinandrian0226@gmail.com</a>.</p>
        </Section>

        <p className="mt-10 text-xs text-charcoal-muted">
          Lihat juga <Link href="/privasi" className="underline">Kebijakan Privasi</Link>.
        </p>
      </main>
    </div>
  );
}
