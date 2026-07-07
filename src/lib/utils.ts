import type {
  HealthStatus,
  RiskLevel,
  RecoveryTrend,
  PlantMode,
  PhotoType,
} from "./types";

// Helper className gabungan (mirip clsx ringan)
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export const HEALTH_META: Record<
  HealthStatus | "unknown",
  { label: string; color: string; bg: string; ring: string; dot: string }
> = {
  healthy: {
    label: "Sehat",
    color: "text-leaf-700 dark:text-leaf-300",
    bg: "bg-leaf-100 dark:bg-leaf-900/40",
    ring: "ring-leaf-300 dark:ring-leaf-700",
    dot: "bg-leaf-500",
  },
  mild: {
    label: "Gejala Ringan",
    color: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-100 dark:bg-amber-900/30",
    ring: "ring-amber-300 dark:ring-amber-700",
    dot: "bg-amber-500",
  },
  serious: {
    label: "Serius",
    color: "text-orange-700 dark:text-orange-300",
    bg: "bg-orange-100 dark:bg-orange-900/30",
    ring: "ring-orange-300 dark:ring-orange-700",
    dot: "bg-orange-500",
  },
  critical: {
    label: "Kritis",
    color: "text-red-700 dark:text-red-300",
    bg: "bg-red-100 dark:bg-red-900/30",
    ring: "ring-red-300 dark:ring-red-700",
    dot: "bg-red-500",
  },
  unknown: {
    label: "Belum Dinilai",
    color: "text-gray-600 dark:text-gray-300",
    bg: "bg-gray-100 dark:bg-gray-800",
    ring: "ring-gray-300 dark:ring-gray-700",
    dot: "bg-gray-400",
  },
};

export const RISK_META: Record<
  RiskLevel,
  { label: string; color: string; bg: string }
> = {
  low: {
    label: "Risiko Rendah",
    color: "text-leaf-700 dark:text-leaf-300",
    bg: "bg-leaf-100 dark:bg-leaf-900/40",
  },
  medium: {
    label: "Risiko Sedang",
    color: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-100 dark:bg-amber-900/40",
  },
  high: {
    label: "Risiko Tinggi",
    color: "text-orange-700 dark:text-orange-300",
    bg: "bg-orange-100 dark:bg-orange-900/40",
  },
  emergency: {
    label: "Darurat",
    color: "text-red-700 dark:text-red-300",
    bg: "bg-red-100 dark:bg-red-900/40",
  },
};

export const RECOVERY_META: Record<
  RecoveryTrend,
  { label: string; emoji: string; color: string; bg: string }
> = {
  improving: {
    label: "Membaik",
    emoji: "📈",
    color: "text-leaf-700 dark:text-leaf-300",
    bg: "bg-leaf-100 dark:bg-leaf-900/40",
  },
  stable: {
    label: "Stabil",
    emoji: "➡️",
    color: "text-blue-700 dark:text-blue-300",
    bg: "bg-blue-100 dark:bg-blue-900/40",
  },
  worsening: {
    label: "Memburuk",
    emoji: "📉",
    color: "text-red-700 dark:text-red-300",
    bg: "bg-red-100 dark:bg-red-900/40",
  },
  needs_action: {
    label: "Butuh Tindakan",
    emoji: "⚠️",
    color: "text-orange-700 dark:text-orange-300",
    bg: "bg-orange-100 dark:bg-orange-900/40",
  },
};

export const URGENCY_META: Record<string, { label: string; color: string }> = {
  high: { label: "Mendesak", color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
  medium: { label: "Sedang", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  low: { label: "Santai", color: "bg-leaf-100 text-leaf-700 dark:bg-leaf-900/40 dark:text-leaf-300" },
};

export const ISSUE_TYPE_LABEL: Record<string, string> = {
  disease: "Penyakit",
  pest: "Hama",
  deficiency: "Defisiensi Nutrisi",
  care: "Perawatan",
  environment: "Lingkungan",
  aging: "Penuaan Alami",
  other: "Lainnya",
};

export const PLANT_MODE_META: Record<
  PlantMode,
  { label: string; emoji: string; desc: string }
> = {
  general: { label: "Umum", emoji: "🌿", desc: "Analisa standar untuk semua tanaman" },
  aroid: { label: "Aroid Mode", emoji: "🪴", desc: "Khusus monstera, philodendron, anthurium variegata" },
  bonsai: { label: "Bonsai Mode", emoji: "🎍", desc: "Khusus bonsai: pruning, akar, posisi cahaya" },
};

export const PHOTO_TYPE_META: Record<
  PhotoType,
  { label: string; hint: string; emoji: string }
> = {
  whole: { label: "Seluruh Tanaman", hint: "Tampak penuh", emoji: "🪴" },
  leaf: { label: "Daun Close-up", hint: "Detail permukaan daun", emoji: "🍃" },
  stem: { label: "Batang / Petiol", hint: "Batang & tangkai", emoji: "🌱" },
  medium: { label: "Media Tanam", hint: "Tanah/moss/sekam", emoji: "🟤" },
  root: { label: "Akar (opsional)", hint: "Jika tersedia", emoji: "🫚" },
};

export const LIGHT_META: Record<string, { label: string; emoji: string }> = {
  low: { label: "Cahaya Rendah", emoji: "🌑" },
  medium: { label: "Cahaya Sedang", emoji: "🌥️" },
  bright: { label: "Terang Tidak Langsung", emoji: "🌤️" },
  direct: { label: "Matahari Langsung", emoji: "☀️" },
};

export const LOCATION_META: Record<string, { label: string; emoji: string }> = {
  indoor: { label: "Indoor", emoji: "🏠" },
  outdoor: { label: "Outdoor", emoji: "🌳" },
};

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function formatDateShort(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

// Selisih hari relatif ("3 hari lagi", "telat 2 hari", "hari ini")
export function relativeDays(iso: string): { text: string; overdue: boolean } {
  const now = new Date();
  const d = new Date(iso);
  const ms = d.getTime() - new Date(now.toDateString()).getTime();
  const days = Math.round(ms / 86400000);
  if (days < 0) return { text: `telat ${Math.abs(days)} hari`, overdue: true };
  if (days === 0) return { text: "hari ini", overdue: true };
  if (days === 1) return { text: "besok", overdue: false };
  return { text: `${days} hari lagi`, overdue: false };
}

export function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}
