import { ShieldCheck, ShieldAlert, ShieldX, Siren } from "lucide-react";
import { RISK_META, cn } from "@/lib/utils";
import type { RiskLevel } from "@/lib/types";

const RISK_ICON: Record<RiskLevel, React.ElementType> = {
  low: ShieldCheck,
  medium: ShieldAlert,
  high: ShieldX,
  emergency: Siren,
};

export function RiskBadge({
  level,
  className,
}: {
  level: RiskLevel | string | null | undefined;
  className?: string;
}) {
  const key = (level as RiskLevel) ?? "low";
  const meta = RISK_META[key] ?? RISK_META.low;
  const Icon = RISK_ICON[key] ?? ShieldCheck;
  return (
    <span className={cn("pill", meta.bg, meta.color, className)}>
      <Icon className="h-3.5 w-3.5" />
      {meta.label}
    </span>
  );
}
