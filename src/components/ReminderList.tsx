"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Droplets, FlaskConical, Stethoscope, Camera, Check, Leaf, Loader2 } from "lucide-react";
import { relativeDays, cn } from "@/lib/utils";

export interface ReminderItem {
  id: string; plant_id: string | null; plant_name: string; cover: string | null;
  title: string; reminder_type: string; due_date: string | null;
}

const ICON: Record<string, React.ElementType> = { watering: Droplets, fertilizer: FlaskConical, treatment: Stethoscope, follow_up_scan: Camera };

export function ReminderList({ reminders }: { reminders: ReminderItem[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [done, setDone] = useState<Set<string>>(new Set());

  async function markDone(id: string) {
    setBusy(id);
    await fetch(`/api/reminders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_done: true }) });
    setDone((s) => new Set(s).add(id));
    setBusy(null);
    router.refresh();
  }

  const visible = reminders.filter((r) => !done.has(r.id));
  if (visible.length === 0)
    return <div className="card flex items-center gap-3 text-sm text-charcoal-muted"><Leaf className="h-5 w-5 text-leaf-400" /> Tidak ada reminder. Semua tanaman terurus.</div>;

  return (
    <div className="space-y-2">
      {visible.map((r) => {
        const Icon = ICON[r.reminder_type] || Camera;
        const rel = r.due_date ? relativeDays(r.due_date) : { text: "", overdue: false };
        return (
          <div key={r.id} className={cn("card flex items-center gap-3 py-3", rel.overdue && "border-l-4 border-orange-400")}>
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-sage-100 dark:bg-white/5">
              {r.cover ? <Image src={r.cover} alt="" fill className="object-cover" sizes="40px" /> : <span className="flex h-full items-center justify-center text-leaf-400"><Leaf className="h-5 w-5" /></span>}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-charcoal dark:text-sage-50">{r.title}</p>
              <p className="flex items-center gap-1.5 text-xs text-charcoal-muted">
                <Icon className="h-3.5 w-3.5" /> {r.plant_name}
                {rel.text && <span className={cn("font-medium", rel.overdue ? "text-orange-600" : "text-charcoal-muted")}>· {rel.text}</span>}
              </p>
            </div>
            <button onClick={() => markDone(r.id)} disabled={busy === r.id}
              className="flex items-center gap-1 rounded-xl bg-leaf-100 px-2.5 py-1.5 text-xs font-semibold text-leaf-800 transition hover:bg-leaf-200 dark:bg-leaf-900/40 dark:text-leaf-300">
              {busy === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Selesai
            </button>
          </div>
        );
      })}
    </div>
  );
}
