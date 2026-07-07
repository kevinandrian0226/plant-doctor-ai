"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BellPlus, Camera, FileDown, Loader2, Check, X } from "lucide-react";
import { downloadReportPdf } from "@/lib/report-pdf";
import type { DiagnosisResult } from "@/lib/types";

const REMINDER_TYPES = [
  { v: "watering", label: "Siram" },
  { v: "fertilizer", label: "Pupuk" },
  { v: "treatment", label: "Treatment" },
  { v: "follow_up_scan", label: "Follow-up scan" },
];

export function ResultActions({ plantId, result, plantName }: { plantId: string; result: DiagnosisResult; plantName: string }) {
  const [pdfBusy, setPdfBusy] = useState(false);
  const [open, setOpen] = useState(false);

  async function downloadPdf() {
    setPdfBusy(true);
    try {
      await downloadReportPdf(result, { plantName, date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) });
    } finally { setPdfBusy(false); }
  }

  const cls = "flex flex-col items-center gap-1.5 rounded-2xl border border-sage-200 bg-white p-3 text-center text-xs font-semibold text-leaf-800 transition hover:bg-sage-50 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-sage-100";

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <button onClick={() => setOpen(true)} className={cls}><BellPlus className="h-5 w-5" /> Buat Reminder</button>
        <Link href={`/plants/${plantId}?tab=recovery`} className={cls}><Camera className="h-5 w-5" /> Foto Follow-up</Link>
        <button onClick={downloadPdf} disabled={pdfBusy} className={cls}>
          {pdfBusy ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileDown className="h-5 w-5" />}
          {pdfBusy ? "Menyiapkan..." : "Download PDF"}
        </button>
      </div>
      {open && <ReminderForm plantId={plantId} onClose={() => setOpen(false)} />}
    </div>
  );
}

function ReminderForm({ plantId, onClose }: { plantId: string; onClose: () => void }) {
  const router = useRouter();
  const [title, setTitle] = useState("Follow-up scan");
  const [type, setType] = useState("follow_up_scan");
  const [due, setDue] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().slice(0, 10);
  });
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function save() {
    setSaving(true);
    await fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plant_id: plantId, title, reminder_type: type, due_date: due }),
    });
    setSaving(false);
    setDone(true);
    router.refresh();
    setTimeout(onClose, 1100);
  }

  return (
    <div className="card border border-leaf-200 dark:border-leaf-800">
      <div className="mb-3 flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm font-semibold"><BellPlus className="h-4 w-4 text-leaf-600" /> Buat Reminder</p>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
      </div>
      <div className="space-y-3">
        <div><label className="label">Judul</label><input value={title} onChange={(e) => setTitle(e.target.value)} className="input" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Jenis</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="input">
              {REMINDER_TYPES.map((t) => <option key={t.v} value={t.v}>{t.label}</option>)}
            </select>
          </div>
          <div><label className="label">Jatuh tempo</label><input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="input" /></div>
        </div>
      </div>
      <button onClick={save} disabled={saving || done} className="btn-primary mt-3 w-full">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : done ? <Check className="h-4 w-4" /> : <BellPlus className="h-4 w-4" />}
        {done ? "Reminder dibuat" : "Simpan Reminder"}
      </button>
    </div>
  );
}
