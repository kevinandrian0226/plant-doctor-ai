import { cn } from "@/lib/utils";

// Cincin skor kesehatan (SVG) 0..100 — premium, track sage
export function HealthScore({
  score,
  size = 96,
  label = "skor",
}: {
  score: number;
  size?: number;
  label?: string;
}) {
  const stroke = size >= 80 ? 8 : 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference - (clamped / 100) * circumference;

  const color =
    clamped >= 75
      ? "stroke-leaf-500"
      : clamped >= 50
      ? "stroke-amber-500"
      : clamped >= 30
      ? "stroke-orange-500"
      : "stroke-red-500";

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          className="fill-none stroke-sage-200 dark:stroke-white/10"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn("fill-none transition-all duration-700 ease-out", color)}
        />
      </svg>
      <div className="absolute flex flex-col items-center leading-none">
        <span
          className="font-bold text-charcoal dark:text-sage-50"
          style={{ fontSize: size * 0.26 }}
        >
          {Math.round(clamped)}
        </span>
        {size >= 64 && (
          <span className="mt-0.5 text-[10px] uppercase tracking-wide text-charcoal-muted">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
