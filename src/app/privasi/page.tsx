import type { Metadata } from "next";
import Link from "next/link";
import { Leaf, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Kebijakan Privasi | Plant Doctor AI",
  description: "Bagaimana Plant Doctor AI mengumpulkan, menggunakan, dan melindungi data kamu.",
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

export default function PrivasiPage() {
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
        <h1 className="display-title mt-3 text-3xl sm:text-4xl">Kebijakan Privasi</h1>
        <p className="mt-2 text-sm text-charcoal-muted">Terakhir diperbarui: {UPDATED}</p>

        <p className="mt-6 text-sm leading-relaxed text-charcoal-light dark:text-sage-200">
          Plant Doctor AI (&ldquo;kami&rdquo;) menghargai privasimu. Halaman ini menjelaskan data apa yang kami kumpulkan saat kamu memakai aplikasi, bagaimana kami menggunakannya, dan pilihan yang kamu miliki.
        </p>

        <Section title="1. Data yang kami kumpulkan">
          <p>Saat kamu membuat akun dan memakai layanan, kami dapat mengumpulkan: alamat email dan nama (dari pendaftaran email/password atau login Google), foto tanaman yang kamu unggah, serta data koleksi yang kamu isi sendiri (nama tanaman, lokasi, jadwal siram/pupuk, catatan). Kami juga menyimpan riwayat diagnosis, treatment, pengingat, listing marketplace, dan permintaan konsultasi yang kamu buat.</p>
        </Section>

        <Section title="2. Bagaimana data digunakan">
          <p>Data dipakai untuk menjalankan fitur inti: mendiagnosis tanaman dari foto, menyimpan koleksi &amp; riwayat, membuat panduan perawatan dan pengingat, serta menampilkan katalog/marketplace publik <strong>hanya jika kamu memilih membagikannya</strong>. Foto dan konteks tanaman dikirim ke penyedia model AI untuk menghasilkan analisis.</p>
        </Section>

        <Section title="3. Berbagi & pihak ketiga">
          <p>Kami tidak menjual datamu. Untuk menjalankan layanan, kami menggunakan penyedia pihak ketiga: Supabase (database, autentikasi, penyimpanan foto), Anthropic (pemrosesan AI atas foto/teks tanaman), Vercel (hosting), dan Google (opsi login). Konten yang kamu tandai publik (halaman tanaman, profil kolektor, listing) dapat dilihat siapa saja, termasuk nomor WhatsApp yang kamu cantumkan pada iklan.</p>
        </Section>

        <Section title="4. Penyimpanan & keamanan">
          <p>Data disimpan di infrastruktur Supabase dengan Row Level Security sehingga data privatmu hanya dapat diakses oleh akunmu. Meski kami berupaya menjaga keamanan, tidak ada sistem yang 100% aman. Jaga kerahasiaan kata sandimu.</p>
        </Section>

        <Section title="5. Pilihan & hak kamu">
          <p>Kamu dapat mengedit atau menghapus tanaman, listing, dan profil publikmu kapan saja dari dalam aplikasi. Untuk menghapus akun beserta seluruh datamu, hubungi kami melalui kontak di bawah dan kami akan memprosesnya.</p>
        </Section>

        <Section title="6. Cookie">
          <p>Kami hanya menggunakan cookie yang diperlukan untuk menjaga sesi login kamu tetap aktif. Kami tidak memakai cookie iklan.</p>
        </Section>

        <Section title="7. Anak-anak">
          <p>Layanan ini tidak ditujukan untuk anak di bawah 13 tahun. Kami tidak dengan sengaja mengumpulkan data dari anak-anak.</p>
        </Section>

        <Section title="8. Perubahan">
          <p>Kebijakan ini dapat diperbarui sewaktu-waktu. Perubahan penting akan ditandai dengan tanggal &ldquo;terakhir diperbarui&rdquo; di atas.</p>
        </Section>

        <Section title="9. Kontak">
          <p>Ada pertanyaan soal privasi? Hubungi kami di <a href="mailto:kevinandrian0226@gmail.com" className="font-medium text-leaf-700 underline dark:text-leaf-300">kevinandrian0226@gmail.com</a>.</p>
        </Section>

        <p className="mt-10 text-xs text-charcoal-muted">
          Lihat juga <Link href="/ketentuan" className="underline">Syarat &amp; Ketentuan</Link>.
        </p>
      </main>
    </div>
  );
}
