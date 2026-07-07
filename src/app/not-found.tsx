import Link from "next/link";
import { Leaf } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-leaf-100 text-leaf-500 dark:bg-leaf-900/40">
        <Leaf className="h-8 w-8" />
      </span>
      <h1 className="text-2xl font-bold">Halaman tidak ditemukan</h1>
      <p className="text-sm text-gray-500">
        Sepertinya tanaman ini sudah dipindahkan ke pot lain.
      </p>
      <Link href="/dashboard" className="btn-primary">
        Kembali ke Dashboard
      </Link>
    </div>
  );
}
