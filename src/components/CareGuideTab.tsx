"use client";

import { useState } from "react";
import { Sun, Droplets, Wind, Thermometer, Sprout, FlaskConical, Repeat, ShieldAlert, Sparkles, Loader2, CalendarPlus, Check } from "lucide-react";

type Guide = {
  light: string; water: string; humidity: string; temperature: string;
  soil: string; fertilizer: string; repotting: string; tips: string[]; toxicity: string;
};

const ROWS: { key: keyof Guide; label: string; icon: React.ElementType }[] = [
  { key: "light", label: "Cahaya", icon: Sun },
  { key: "water", label: "Penyiraman", icon: Droplets },
  { key: "humidity", label: "Kelembapan", icon: Wind },
  { key: "temperature", label: "Suhu", icon: Thermometer },
  { key: "soil", label: "Media tanam", icon: Sprout },
  { key: "fertilizer", label: "Pupuk", icon: FlaskConical },
  { key: "repotting", label: "Repotting", icon: Repeat },
  { key: "toxicity", label: "Toksisitas", icon: ShieldAlert },
];

export function CareGuideTab({
  plantId, plantName, initialGuide,
}: {
  plantId: string; plantName: string; scientificName?: string | null; category?: string | null; initialGuide?: unknown;
}) {
  const [guide, setGuide] = useState<Guide | null>((initialGuide as Guide) || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scheduleDone, setScheduleDone] = useState(false);
  const [scheduling, setScheduling] = useState(false);

  const generate = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/plants/${plantId}/care-guide`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error);
      setGuide(data.guide);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal membuat panduan.");
    } finally { setLoading(false); }
  };

  const makeSchedule = async () => {
    setScheduling(true);
    try {
      const res = await fetch(`/api/plants/${plantId}/care-schedule`, { method: "POST" });
      if (res.ok) setScheduleDone(true);
    } finally { setScheduling(false); }
  };

  if (!guide) {
    return (
      <div className="card flex flex-col items-center gap-4 py-12 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-3xl bg-leaf-50 text-leaf-600 dark:bg-white/5"><Sparkles className="h-7 w-7" strokeWidth={1.75} /></span>
        <div>
          <p className="font-semibold">Panduan perawatan {plantName}</p>
          <p className="mt-1 max-w-xs text-sm text-charcoal-muted">Buat panduan lengkap (cahaya, siram, media, pupuk, repotting) otomatis dengan AI.</p>
        </div>
        <button onClick={generate} disabled={loading} className="btn-primary">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Menyusun..." : "Buat Panduan AI"}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="eyebrow">Panduan Perawatan</h3>
        <button onClick={makeSchedule} disabled={scheduling || scheduleDone} className="btn-secondary text-xs">
          {scheduleDone ? <Check className="h-4 w-4 text-leaf-600" /> : scheduling ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarPlus className="h-4 w-4" />}
          {scheduleDone ? "Jadwal dibuat" : "Buat jadwal perawatan"}
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {ROWS.map((r) => guide[r.key] && (
          <div key={r.key} className="card-tight flex gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-leaf-50 text-leaf-700 dark:bg-white/5"><r.icon className="h-5 w-5" /></span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-charcoal-muted">{r.label}</p>
              <p className="mt-0.5 text-sm leading-relaxed">{guide[r.key] as string}</p>
            </div>
          </div>
        ))}
      </div>
      {guide.tips?.length > 0 && (
        <div className="card">
          <p className="mb-2 eyebrow">Tips</p>
          <ul className="space-y-1.5 text-sm">
            {guide.tips.map((t, i) => <li key={i} className="flex gap-2"><span className="text-gold-500">✦</span>{t}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
