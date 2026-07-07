import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-leaf-50 via-sand-50 to-leaf-100 px-4 py-12 dark:from-leaf-950 dark:via-gray-950 dark:to-leaf-950">
      {/* Lapisan botanical blur premium */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {/* gradient blobs */}
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-leaf-300/40 blur-3xl dark:bg-leaf-700/20" />
        <div className="absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-leaf-400/30 blur-3xl dark:bg-leaf-800/20" />
        <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-200/30 blur-3xl dark:bg-emerald-900/10" />

        {/* siluet daun (blur) */}
        <svg
          className="absolute -left-10 top-10 h-72 w-72 rotate-[-18deg] text-leaf-500/20 blur-[2px] dark:text-leaf-400/10"
          viewBox="0 0 100 100"
          fill="currentColor"
        >
          <path d="M50 5C25 25 15 55 30 90c5-30 20-55 45-70C62 28 52 45 48 70 60 50 70 30 50 5z" />
        </svg>
        <svg
          className="absolute bottom-8 right-6 h-80 w-80 rotate-[24deg] text-leaf-600/20 blur-[2px] dark:text-leaf-500/10"
          viewBox="0 0 100 100"
          fill="currentColor"
        >
          <path d="M50 5C25 25 15 55 30 90c5-30 20-55 45-70C62 28 52 45 48 70 60 50 70 30 50 5z" />
        </svg>
        <svg
          className="absolute right-1/4 top-1/4 h-44 w-44 rotate-[60deg] text-emerald-500/15 blur-[1px] dark:text-emerald-400/10"
          viewBox="0 0 100 100"
          fill="currentColor"
        >
          <path d="M50 5C25 25 15 55 30 90c5-30 20-55 45-70C62 28 52 45 48 70 60 50 70 30 50 5z" />
        </svg>

        {/* glass sheen */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent dark:from-black/40" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Link
          href="/"
          className="mb-6 block text-center text-sm text-gray-500 transition hover:text-leaf-600"
        >
          ← Kembali ke beranda
        </Link>
        {children}
      </div>
    </div>
  );
}
