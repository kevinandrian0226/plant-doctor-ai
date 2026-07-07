import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Plant Doctor AI — Diagnosa Tanaman dari Foto",
  description:
    "Deteksi jenis tanaman, kondisi kesehatan, penyakit & hama, lalu dapatkan rekomendasi treatment step-by-step. Untuk kolektor aroid, monstera, anthurium, bonsai, sukulen & lainnya.",
};

export const viewport: Viewport = {
  themeColor: "#2c7035",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="font-sans">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
