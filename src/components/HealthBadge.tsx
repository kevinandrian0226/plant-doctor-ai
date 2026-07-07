import { HEALTH_META, cn } from "@/lib/utils";
import type { HealthStatus } from "@/lib/types";

export function HealthBadge({
  status,
  className,
}: {
  status: HealthStatus | "unknown" | string;
  className?: string;
}) {
  const meta = HEALTH_META[(status as HealthStatus) ?? "unknown"] ?? HEALTH_META.unknown;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
        meta.bg,
        meta.color,
        meta.ring,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}
