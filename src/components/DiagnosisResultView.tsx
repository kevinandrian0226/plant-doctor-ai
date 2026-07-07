import Image from "next/image";
import {
  Sprout,
  Bug,
  Stethoscope,
  Droplets,
  Wind,
  Sun,
  Layers,
  CircleHelp,
  Lightbulb,
  ListChecks,
  ShieldAlert,
  Scissors,
  Search,
  CalendarClock,
  FlaskConical,
  Clock3,
  Hourglass,
  Eye,
  Ban,
  Info,
  AlertTriangle,
} from "lucide-react";
import { HealthBadge } from "./HealthBadge";
import { HealthScore } from "./HealthScore";
import { RiskBadge } from "./RiskBadge";
import { AroidPanel, BonsaiPanel } from "./SpecialModePanel";
import { TreatmentTimeline } from "./TreatmentTimeline";
import { ISSUE_TYPE_LABEL, HEALTH_META, cn } from "@/lib/utils";
import type { DiagnosisResult, IssueType, AroidAnalysis, BonsaiAnalysis } from "@/lib/types";

const ISSUE_ICON: Record<IssueType, React.ElementType> = {
  disease: Stethoscope,
  pest: Bug,
  deficiency: Droplets,
  care: Sprout,
  environment: Wind,
  aging: Clock3,
  other: CircleHelp,
};

const FOLLOWUP_ICON = [Clock3, Hourglass, CalendarClock];

export function DiagnosisResultView({
  result,
  photoUrl,
}: {
  result: DiagnosisResult;
  photoUrl?: string | null;
}) {
  const flags = [
    { active: result.needs_isolation, icon: ShieldAlert, label: "Perlu isolasi" },
    { active: result.needs_pruning, icon: Scissors, label: "Perlu potong daun" },
    { active: result.needs_root_check, icon: Search, label: "Cek akar" },
  ].filter((f) => f.active);

  const envFixes = [
    { icon: Layers, label: "Media Tanam", text: result.medium_fix },
    { icon: Droplets, label: "Penyiraman", text: result.watering_fix },
    { icon: Sun, label: "Cahaya", text: result.light_fix },
    { icon: Wind, label: "Sirkulasi Udara", text: result.airflow_fix },
  ].filter((f) => f.text);

  return (
    <div className="space-y-5">
      {/* Header identifikasi */}
      <div className="card overflow-hidden p-0">
        <div className="grid gap-0 md:grid-cols-[200px_1fr]">
          {photoUrl ? (
            <div className="relative h-48 w-full md:h-full">
              <Image src={photoUrl} alt={result.species_name} fill className="object-cover" sizes="200px" />
            </div>
          ) : null}
          <div className="flex flex-col justify-center gap-3 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-leaf-600">{result.category}</p>
                <h2 className="text-xl font-bold">{result.species_name}</h2>
                {result.scientific_name && (
                  <p className="text-sm italic text-gray-500">{result.scientific_name}</p>
                )}
              </div>
              <HealthScore score={result.health_score} size={84} />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <HealthBadge status={result.health_status} />
              <RiskBadge level={result.risk_level} />
              <span className="text-xs text-gray-400">
                Keyakinan ID: {Math.round(result.identify_confidence * 100)}%
              </span>
            </div>
            {result.identify_note && (
              <p className="text-xs text-gray-400">Catatan: {result.identify_note}</p>
            )}
            {result.alternatives && result.alternatives.length > 0 && (
              <p className="text-xs text-gray-400">
                Kemungkinan lain:{" "}
                {result.alternatives
                  .map((a) => `${a.name} (${Math.round(a.confidence * 100)}%)`)
                  .join(", ")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Ringkasan + flag tindakan */}
      <div
        className={cn(
          "card border-l-4",
          HEALTH_META[result.health_status]?.ring.replace("ring-", "border-")
        )}
      >
        <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-200">{result.summary}</p>
        {flags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {flags.map((f) => (
              <span
                key={f.label}
                className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-900/40 dark:text-orange-300"
              >
                <f.icon className="h-3.5 w-3.5" /> {f.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Konsultasi ahli */}
      {result.warning && (
        <div className="card flex items-start gap-3 border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <p className="text-sm text-amber-800 dark:text-amber-200">{result.warning}</p>
        </div>
      )}

      {result.consult_expert && (
        <div className="card flex items-start gap-3 border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <p className="text-sm text-red-700 dark:text-red-300">
            <span className="font-semibold">Disarankan konsultasi ahli/nursery.</span> Kondisi ini
            sebaiknya diperiksa langsung oleh spesialis tanaman sebelum tindakan lanjutan.
          </p>
        </div>
      )}

      {/* Mode khusus */}
      {result.special_mode === "aroid" && result.aroid && (
        <AroidPanel data={result.aroid as AroidAnalysis} />
      )}
      {result.special_mode === "bonsai" && result.bonsai && (
        <BonsaiPanel data={result.bonsai as BonsaiAnalysis} />
      )}

      {/* Masalah terdeteksi */}
      {result.symptoms && result.symptoms.length > 0 && (
        <section>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
            <Eye className="h-4 w-4" /> Gejala Terlihat
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {result.symptoms.map((s, i) => {
              const sev =
                s.severity === "high"
                  ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                  : s.severity === "medium"
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                  : "bg-leaf-100 text-leaf-700 dark:bg-leaf-900/40 dark:text-leaf-300";
              return (
                <div key={i} className="card">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{s.symptom}</p>
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", sev)}>
                      {s.severity}
                    </span>
                  </div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">{areaLabel(s.area)}</p>
                  {s.description && (
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{s.description}</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {result.issues.length > 0 && (
        <section>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
            <Bug className="h-4 w-4" /> Kemungkinan Penyebab
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {result.issues.map((issue, i) => {
              const Icon = ISSUE_ICON[issue.type] || CircleHelp;
              return (
                <div key={i} className="card">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-leaf-50 text-leaf-600 dark:bg-leaf-900/40">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{issue.name}</p>
                        <p className="text-xs text-gray-400">
                          {ISSUE_TYPE_LABEL[issue.type] || issue.type}
                        </p>
                      </div>
                    </div>
                    <HealthBadge status={issue.severity} />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{issue.description}</p>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div
                      className="h-full rounded-full bg-leaf-400"
                      style={{ width: `${Math.round(issue.confidence * 100)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-right text-[10px] text-gray-400">
                    keyakinan {Math.round(issue.confidence * 100)}%
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Treatment step-by-step */}
      {result.treatments.length > 0 && (
        <section>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
            <ListChecks className="h-4 w-4" /> Rencana Perawatan
          </h3>
          <TreatmentTimeline steps={result.treatments} />
        </section>
      )}

      {/* Perbaikan lingkungan */}
      {envFixes.length > 0 && (
        <section>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
            <Wind className="h-4 w-4" /> Perbaikan Lingkungan
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {envFixes.map((f) => (
              <div key={f.label} className="card">
                <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                  <f.icon className="h-3.5 w-3.5" /> {f.label}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-200">{f.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Rekomendasi produk */}
      {result.product_recommendation && (
        <section className="card flex items-start gap-3">
          <FlaskConical className="mt-0.5 h-5 w-5 shrink-0 text-leaf-600" />
          <div>
            <p className="text-sm font-semibold">Rekomendasi Produk (umum & aman)</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">{result.product_recommendation}</p>
            <p className="mt-1 text-xs text-gray-400">
              Selalu baca label & ikuti dosis anjuran. Uji pada area kecil dulu.
            </p>
          </div>
        </section>
      )}

      {/* Jadwal follow-up */}
      {result.avoid && result.avoid.length > 0 && (
        <section className="card border border-red-100 dark:border-red-900/40">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-red-700 dark:text-red-300">
            <Ban className="h-4 w-4" /> Hindari
          </h3>
          <ul className="space-y-1.5">
            {result.avoid.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-200">
                <Ban className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" /> {a}
              </li>
            ))}
          </ul>
        </section>
      )}

      {result.followups.length > 0 && (
        <section>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
            <CalendarClock className="h-4 w-4" /> Jadwal Follow-up
          </h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {result.followups
              .slice()
              .sort((a, b) => a.day - b.day)
              .map((f, i) => {
                const Icon = FOLLOWUP_ICON[i] || CalendarClock;
                return (
                  <div key={i} className="card">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-leaf-100 text-leaf-600 dark:bg-leaf-900/40">
                        <Icon className="h-4 w-4" />
                      </span>
                      <p className="text-sm font-bold">Hari ke-{f.day}</p>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-200">{f.action}</p>
                    {f.focus && <p className="mt-1 text-xs text-gray-400">Pantau: {f.focus}</p>}
                  </div>
                );
              })}
          </div>
        </section>
      )}

      {/* Tips perawatan */}
      {result.care_tips.length > 0 && (
        <section className="card bg-leaf-50/60 dark:bg-leaf-900/20">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-leaf-700 dark:text-leaf-300">
            <Lightbulb className="h-4 w-4" /> Tips Perawatan Jangka Panjang
          </h3>
          <ul className="space-y-2">
            {result.care_tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-200">
                <Sprout className="mt-0.5 h-4 w-4 shrink-0 text-leaf-500" />
                {tip}
              </li>
            ))}
          </ul>
        </section>
      )}

      {result.disclaimer && (
        <p className="flex items-start gap-1.5 px-1 text-xs text-gray-400">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {result.disclaimer}
        </p>
      )}
    </div>
  );
}

const AREA_LABEL: Record<string, string> = {
  leaf: "Daun",
  stem: "Batang",
  root: "Akar",
  soil: "Media tanam",
  whole_plant: "Seluruh tanaman",
};

function areaLabel(area: string): string {
  return AREA_LABEL[area] || area;
}
