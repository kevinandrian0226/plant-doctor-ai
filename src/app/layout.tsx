import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz"],
});

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
    <html lang="id" suppressHydrationWarning className={`${inter.variable} ${fraunces.variable}`}>
      <body className="font-sans">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
