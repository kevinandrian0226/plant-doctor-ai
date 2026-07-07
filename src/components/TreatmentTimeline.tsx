import { Check } from "lucide-react";
import { URGENCY_META, cn } from "@/lib/utils";
import type { TreatmentStep } from "@/lib/types";

/** Treatment timeline — garis vertikal dengan node bernomor */
export function TreatmentTimeline({ steps }: { steps: TreatmentStep[] }) {
  const ordered = steps.slice().sort((a, b) => a.step - b.step);
  return (
    <ol className="relative space-y-4 pl-2">
      {ordered.map((t, i) => {
        const urg = URGENCY_META[t.urgency] || URGENCY_META.low;
        const last = i === ordered.length - 1;
        return (
          <li key={t.step} className="relative flex gap-4">
            {/* garis penghubung */}
            {!last && (
              <span className="absolute left-[15px] top-9 h-[calc(100%-4px)] w-px bg-sage-200 dark:bg-white/10" />
            )}
            <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-leaf-700 text-sm font-bold text-white shadow-soft">
              {t.step}
            </span>
            <div className="flex-1 pb-1">
              <div className="mb-1 flex items-start justify-between gap-2">
                <p className="font-semibold leading-tight text-charcoal dark:text-sage-50">{t.title}</p>
                <span className={cn("pill shrink-0", urg.color)}>{urg.label}</span>
              </div>
              {t.detail && (
                <p className="text-sm text-charcoal-muted dark:text-gray-300">{t.detail}</p>
              )}
            </div>
          </li>
        );
      })}
      <li className="relative flex items-center gap-4 text-charcoal-muted">
        <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage-100 dark:bg-white/5">
          <Check className="h-4 w-4 text-leaf-600" />
        </span>
        <span className="text-sm">Pantau & lanjut ke jadwal follow-up</span>
      </li>
    </ol>
  );
}
