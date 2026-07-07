"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Circle, CircleDot, CheckCircle2, Loader2, ListChecks, RotateCcw, BellRing } from "lucide-react";
import { formatDateShort, cn } from "@/lib/utils";
import type { TreatmentRecord, TreatmentStatus } from "@/lib/db-types";

const META: Record<TreatmentStatus, { label: string; icon: React.ElementType; pill: string }> = {
  pending: { label: "Belum", icon: Circle, pill: "bg-sage-100 text-charcoal-light dark:bg-white/10 dark:text-sage-200" },
  in_progress: { label: "Berjalan", icon: CircleDot, pill: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  completed: { label: "Selesai", icon: CheckCircle2, pill: "bg-leaf-100 text-leaf-800 dark:bg-leaf-900/40 dark:text-leaf-300" },
};

const FILTERS: { v: "all" | TreatmentStatus; label: string }[] = [
  { v: "all", label: "Semua" }, { v: "pending", label: "Belum" }, { v: "in_progress", label: "Berjalan" }, { v: "completed", label: "Selesai" },
];

export function TreatmentTab({ treatments }: { treatments: TreatmentRecord[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | TreatmentStatus>("all");
  const [toast, setToast] = useState<string | null>(null);

  async function setStatus(id: string, status: TreatmentStatus) {
    setBusy(id);
    const res = await fetch(`/api/treatments/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    const data = await res.json().catch(() => ({}));
    setBusy(null);
    if (status === "in_progress" && data?.reminder) {
      setToast("Reminder follow-up dibuat (3 hari).");
      setTimeout(() => setToast(null), 2500);
    }
    router.refresh();
  }

  if (treatments.length === 0)
    return <div className="card text-center text-sm text-charcoal-muted">Belum ada treatment. Lakukan diagnosa untuk membuat rencana perawatan.</div>;

  const doneCount = treatments.filter((t) => t.status === "completed").length;
  const pct = Math.round((doneCount / treatments.length) * 100);
  const shown = filter === "all" ? treatments : treatments.filter((t) => t.status === filter);

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="mb-2 flex items-center justify-between">
          <p className="flex items-center gap-2 text-sm font-semibold"><ListChecks className="h-4 w-4 text-leaf-600" /> Progress Treatment</p>
          <span className="text-sm font-semibold text-leaf-700 dark:text-leaf-300">{doneCount}/{treatments.length}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-sage-100 dark:bg-white/10">
          <div className="h-full rounded-full bg-leaf-600 transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const count = f.v === "all" ? treatments.length : treatments.filter((t) => t.status === f.v).length;
          return (
            <button key={f.v} onClick={() => setFilter(f.v)}
              className={cn("rounded-full px-3 py-1.5 text-xs font-semibold transition",
                filter === f.v ? "bg-leaf-700 text-white" : "bg-sage-100 text-charcoal-light hover:bg-sage-200 dark:bg-white/5 dark:text-sage-200")}>
              {f.label} ({count})
            </button>
          );
        })}
      </div>

      {toast && (
        <div className="flex items-center gap-2 rounded-2xl bg-leaf-100 px-4 py-2.5 text-sm font-medium text-leaf-800 dark:bg-leaf-900/40 dark:text-leaf-300">
          <BellRing className="h-4 w-4" /> {toast}
        </div>
      )}

      {shown.length === 0 ? (
        <div className="card text-center text-sm text-charcoal-muted">Tidak ada treatment pada filter ini.</div>
      ) : (
        <div className="space-y-3">
          {shown.map((t) => {
            const meta = META[t.status];
            const Icon = meta.icon;
            return (
              <div key={t.id} className="card flex gap-3">
                <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", t.status === "completed" ? "text-leaf-600" : t.status === "in_progress" ? "text-amber-500" : "text-charcoal-muted")} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn("font-semibold text-charcoal dark:text-sage-50", t.status === "completed" && "line-through opacity-70")}>{t.title}</p>
                    <span className={cn("pill shrink-0", meta.pill)}>{meta.label}</span>
                  </div>
                  {t.instructions && t.instructions !== t.title && <p className="mt-1 text-sm text-charcoal-muted">{t.instructions}</p>}
                  {t.status === "completed" && t.completed_at && <p className="mt-1 text-xs text-charcoal-muted">Selesai {formatDateShort(t.completed_at)}</p>}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {t.status === "pending" && <Btn busy={busy === t.id} onClick={() => setStatus(t.id, "in_progress")}><CircleDot className="h-3.5 w-3.5" /> Mulai</Btn>}
                    {t.status === "in_progress" && <Btn busy={busy === t.id} onClick={() => setStatus(t.id, "completed")} primary><CheckCircle2 className="h-3.5 w-3.5" /> Tandai Selesai</Btn>}
                    {t.status === "completed" && <Btn busy={busy === t.id} onClick={() => setStatus(t.id, "pending")}><RotateCcw className="h-3.5 w-3.5" /> Batalkan</Btn>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Btn({ children, onClick, busy, primary }: { children: React.ReactNode; onClick: () => void; busy: boolean; primary?: boolean }) {
  return (
    <button onClick={onClick} disabled={busy}
      className={cn("inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50",
        primary ? "bg-leaf-700 text-white hover:bg-leaf-800" : "border border-sage-200 text-leaf-800 hover:bg-sage-50 dark:border-white/10 dark:text-sage-100 dark:hover:bg-white/5")}>
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : children}
    </button>
  );
}
