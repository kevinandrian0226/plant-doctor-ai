import { Sparkles, Sun, Droplets, AlertTriangle, Scissors, Bug } from "lucide-react";
import { HealthScore } from "./HealthScore";
import { RiskBadge } from "./RiskBadge";
import type { AroidAnalysis, BonsaiAnalysis } from "@/lib/types";

export function AroidPanel({ data }: { data: AroidAnalysis }) {
  return (
    <section className="card border border-leaf-200 bg-gradient-to-br from-leaf-50/80 to-white dark:border-leaf-800 dark:from-leaf-900/30 dark:to-transparent">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-leaf-700 dark:text-leaf-300">
        <Sparkles className="h-4 w-4" /> Aroid Mode — Analisa Variegata
      </h3>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <HealthScore score={data.variegation_health_score} size={84} />
          <div>
            <p className="text-xs text-gray-400">Skor Kesehatan Variegata</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs text-gray-500">Risiko browning:</span>
              <RiskBadge level={data.browning_risk} />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Area putih ≈ {Math.round(data.white_area_ratio * 100)}%
              {data.too_much_white && (
                <span className="ml-1 font-semibold text-orange-600">
                  · terlalu banyak putih
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <InfoTile icon={Sun} title="Rekomendasi Cahaya" text={data.light_recommendation} />
        <InfoTile
          icon={Droplets}
          title="Peringatan Overwatering"
          text={data.overwatering_warning}
          warn
        />
      </div>
      {data.notes && (
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{data.notes}</p>
      )}
    </section>
  );
}

export function BonsaiPanel({ data }: { data: BonsaiAnalysis }) {
  const flags = [
    { label: "Daun menguning", active: data.leaf_yellowing },
    { label: "Kekeringan", active: data.dryness },
    { label: "Jamur batang/media", active: data.trunk_or_soil_fungus },
    { label: "Akar terlalu basah", active: data.roots_too_wet },
    { label: "Serangan kutu", active: data.pest_presence },
  ];
  return (
    <section className="card border border-amber-200 bg-gradient-to-br from-amber-50/80 to-white dark:border-amber-800 dark:from-amber-900/20 dark:to-transparent">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-300">
        <Sparkles className="h-4 w-4" /> Bonsai Mode — Analisa Khusus
      </h3>
      <div className="flex flex-wrap gap-2">
        {flags.map((f) => (
          <span
            key={f.label}
            className={
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium " +
              (f.active
                ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                : "bg-leaf-100 text-leaf-700 dark:bg-leaf-900/40 dark:text-leaf-300")
            }
          >
            {f.active ? <AlertTriangle className="h-3 w-3" /> : <Bug className="h-3 w-3 opacity-40" />}
            {f.label}: {f.active ? "ada" : "aman"}
          </span>
        ))}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <InfoTile icon={Scissors} title="Saran Pruning" text={data.pruning_advice} />
        <InfoTile icon={Sun} title="Posisi Cahaya" text={data.light_position_advice} />
      </div>
      {data.notes && (
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{data.notes}</p>
      )}
    </section>
  );
}

function InfoTile({
  icon: Icon,
  title,
  text,
  warn,
}: {
  icon: React.ElementType;
  title: string;
  text: string;
  warn?: boolean;
}) {
  if (!text) return null;
  return (
    <div className="rounded-xl bg-white/70 p-3 dark:bg-white/5">
      <p className={"mb-1 flex items-center gap-1.5 text-xs font-semibold " + (warn ? "text-orange-600 dark:text-orange-300" : "text-gray-500")}>
        <Icon className="h-3.5 w-3.5" /> {title}
      </p>
      <p className="text-sm text-gray-700 dark:text-gray-200">{text}</p>
    </div>
  );
}
