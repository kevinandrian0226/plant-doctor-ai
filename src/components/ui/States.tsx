"use client";

import Link from "next/link";
import { Leaf, AlertCircle, RefreshCw, Loader2 } from "lucide-react";

/** Empty state — ikon dalam lingkaran lembut + judul + deskripsi + aksi opsional */
export function EmptyState({
  icon: Icon = Leaf,
  title,
  description,
  action,
}: {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: { label: string; href?: string; onClick?: () => void; icon?: React.ElementType };
}) {
  const ActionIcon = action?.icon;
  return (
    <div className="card flex flex-col items-center gap-4 py-14 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-sage-100 text-leaf-600 dark:bg-white/5">
        <Icon className="h-8 w-8" strokeWidth={1.75} />
      </span>
      <div className="space-y-1">
        <p className="text-base font-semibold text-charcoal dark:text-sage-50">{title}</p>
        {description && (
          <p className="mx-auto max-w-xs text-sm text-charcoal-muted">{description}</p>
        )}
      </div>
      {action &&
        (action.href ? (
          <Link href={action.href} className="btn-primary">
            {ActionIcon && <ActionIcon className="h-4 w-4" />}
            {action.label}
          </Link>
        ) : (
          <button onClick={action.onClick} className="btn-primary">
            {ActionIcon && <ActionIcon className="h-4 w-4" />}
            {action.label}
          </button>
        ))}
    </div>
  );
}

/** Loading premium — spinner halus dengan label */
export function LoadingState({
  title = "Memuat...",
  subtitle,
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <span className="relative flex h-14 w-14 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-leaf-200/60 dark:bg-leaf-800/40" />
        <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-leaf-700 text-white">
          <Loader2 className="h-6 w-6 animate-spin" />
        </span>
      </span>
      <div>
        <p className="text-sm font-semibold text-charcoal dark:text-sage-50">{title}</p>
        {subtitle && <p className="mt-1 text-xs text-charcoal-muted">{subtitle}</p>}
      </div>
    </div>
  );
}

/** Skeleton list — placeholder kartu saat memuat */
export function SkeletonCards({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card flex gap-4">
          <div className="skeleton h-20 w-20 shrink-0" />
          <div className="flex-1 space-y-2 py-1">
            <div className="skeleton h-4 w-2/3" />
            <div className="skeleton h-3 w-1/2" />
            <div className="skeleton h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Error state jelas — ikon merah, pesan, tombol coba lagi opsional */
export function ErrorState({
  title = "Terjadi kesalahan",
  message,
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900/40 dark:bg-red-900/15">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300">
        <AlertCircle className="h-6 w-6" />
      </span>
      <div>
        <p className="text-sm font-semibold text-red-700 dark:text-red-300">{title}</p>
        {message && <p className="mt-1 text-sm text-red-600/90 dark:text-red-300/80">{message}</p>}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          <RefreshCw className="h-4 w-4" /> Coba lagi
        </button>
      )}
    </div>
  );
}

/** Inline error — banner ringkas untuk form */
export function InlineError({ message }: { message: string }) {
  return (
    <p className="flex items-start gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-300">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {message}
    </p>
  );
}
