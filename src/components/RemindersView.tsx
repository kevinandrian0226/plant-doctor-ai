"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Droplets, FlaskConical, Stethoscope, Camera, Plus, Loader2, X } from "lucide-react";
import { ReminderList, type ReminderItem } from "./ReminderList";
import { cn } from "@/lib/utils";

const MONTHS = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const DOW = ["M","S","S","R","K","J","S"];
const ymd = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const DOT: Record<string, string> = { watering: "bg-sky-500", fertilizer: "bg-amber-500", treatment: "bg-leaf-500", follow_up_scan: "bg-purple-500" };

export function RemindersView({ reminders, plants }: { reminders: ReminderItem[]; plants: { id: string; name: string }[] }) {
  const now = new Date();
  const [cursor, setCursor] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [open, setOpen] = useState(false);

  const marks = new Map<string, Set<string>>();
  reminders.forEach((r) => { if (!r.due_date) return; const k = ymd(new Date(r.due_date)); if (!marks.has(k)) marks.set(k, new Set()); marks.get(k)!.add(r.reminder_type); });

  const year = cursor.getFullYear(), month = cursor.getMonth();
  const firstDow = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);

  const byType = (t: string) => reminders.filter((r) => r.reminder_type === t);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={() => setOpen((v) => !v)} className="btn-primary"><Plus className="h-4 w-4" /> Reminder Baru</button>
      </div>
      {open && <CreateForm plants={plants} onClose={() => setOpen(false)} />}

      <div className="card">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold">{MONTHS[month]} {year}</p>
          <div className="flex gap-1">
            <button onClick={() => setCursor(new Date(year, month - 1, 1))} className="rounded-lg p-1.5 text-gray-400 hover:bg-sage-50 dark:hover:bg-white/5"><ChevronLeft className="h-4 w-4" /></button>
            <button onClick={() => setCursor(new Date(year, month + 1, 1))} className="rounded-lg p-1.5 text-gray-400 hover:bg-sage-50 dark:hover:bg-white/5"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {DOW.map((d, i) => <div key={i} className="py-1 text-[10px] font-semibold text-charcoal-muted">{d}</div>)}
          {cells.map((d, i) => {
            if (d === null) return <div key={i} />;
            const date = new Date(year, month, d);
            const today = ymd(date) === ymd(now);
            const types = marks.get(ymd(date));
            return (
              <div key={i} className={cn("flex aspect-square flex-col items-center justify-center rounded-lg text-xs", today ? "bg-leaf-700 font-bold text-white" : "text-charcoal dark:text-gray-300")}>
                {d}
                <div className="mt-0.5 flex h-1.5 items-center gap-0.5">
                  {types && Array.from(types).slice(0, 3).map((t) => <span key={t} className={cn("h-1 w-1 rounded-full", today ? "bg-white" : DOT[t])} />)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Group icon={Droplets} title="Penyiraman" items={byType("watering")} />
      <Group icon={FlaskConical} title="Pemupukan" items={byType("fertilizer")} />
      <Group icon={Stethoscope} title="Treatment" items={byType("treatment")} />
      <Group icon={Camera} title="Follow-up Scan" items={byType("follow_up_scan")} />
    </div>
  );
}

function Group({ icon: Icon, title, items }: { icon: React.ElementType; title: string; items: ReminderItem[] }) {
  if (items.length === 0) return null;
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 eyebrow"><Icon className="h-4 w-4" /> {title}<span className="rounded-full bg-leaf-100 px-1.5 text-[10px] text-leaf-800 dark:bg-leaf-900/40 dark:text-leaf-300">{items.length}</span></h2>
      <ReminderList reminders={items} />
    </section>
  );
}

function CreateForm({ plants, onClose }: { plants: { id: string; name: string }[]; onClose: () => void }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [type, setType] = useState("watering");
  const [plantId, setPlantId] = useState(plants[0]?.id || "");
  const [due, setDue] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!title.trim()) return;
    setSaving(true);
    await fetch("/api/reminders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, reminder_type: type, plant_id: plantId || null, due_date: due }) });
    setSaving(false); onClose(); router.refresh();
  }

  return (
    <div className="card border border-leaf-200 dark:border-leaf-800">
      <div className="mb-3 flex items-center justify-between"><p className="text-sm font-semibold">Reminder Baru</p><button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button></div>
      <div className="space-y-3">
        <div><label className="label">Judul</label><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="mis. Siram monstera" className="input" /></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><label className="label">Jenis</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="input">
              <option value="watering">Siram</option><option value="fertilizer">Pupuk</option><option value="treatment">Treatment</option><option value="follow_up_scan">Follow-up scan</option>
            </select>
          </div>
          <div><label className="label">Jatuh tempo</label><input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="input" /></div>
        </div>
        {plants.length > 0 && (
          <div><label className="label">Tanaman (opsional)</label>
            <select value={plantId} onChange={(e) => setPlantId(e.target.value)} className="input">
              <option value="">— Tanpa tanaman —</option>
              {plants.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        )}
      </div>
      <button onClick={save} disabled={saving || !title.trim()} className="btn-primary mt-3 w-full">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Simpan Reminder
      </button>
    </div>
  );
}
