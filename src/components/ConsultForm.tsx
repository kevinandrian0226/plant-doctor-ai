"use client";

import { useState } from "react";
import { Send, Loader2, Check, Stethoscope } from "lucide-react";

export function ConsultForm({ plants }: { plants: { id: string; name: string }[] }) {
  const [plantId, setPlantId] = useState("");
  const [topic, setTopic] = useState("Perawatan umum");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || !message.trim()) return;
    if (!contact.trim()) { setError("Isi kontak (WhatsApp/email) agar ahli bisa menghubungimu."); return; }
    setBusy(true); setError(null);
    try {
      const res = await fetch("/api/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plant_id: plantId || null, topic, contact, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error);
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengirim.");
    } finally { setBusy(false); }
  };

  if (done) {
    return (
      <div className="card flex flex-col items-center gap-3 py-12 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-3xl bg-leaf-100 text-leaf-700 dark:bg-leaf-900/40"><Check className="h-7 w-7" /></span>
        <p className="font-semibold">Permintaan terkirim!</p>
        <p className="max-w-sm text-sm text-charcoal-muted">Tim ahli kami akan menghubungimu lewat kontak yang kamu berikan. Terima kasih.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-4">
      <div>
        <label className="label">Tanaman (opsional)</label>
        <select value={plantId} onChange={(e) => setPlantId(e.target.value)} className="input">
          <option value="">— Umum / belum ada —</option>
          {plants.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Topik</label>
        <select value={topic} onChange={(e) => setTopic(e.target.value)} className="input">
          {["Perawatan umum", "Penyakit & hama", "Repotting", "Variegata & aroid", "Bonsai", "Lainnya"].map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Kontak (WhatsApp/email)</label>
        <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="mis. 08xx / email" className="input" required />
      </div>
      <div>
        <div className="flex items-baseline justify-between"><label className="label">Ceritakan masalahmu</label><span className="text-[11px] text-charcoal-muted">{message.length}/2000</span></div>
        <textarea value={message} maxLength={2000} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="Deskripsikan kondisi tanaman & pertanyaanmu..." className="input" />
      </div>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-300">{error}</p>}
      <button type="submit" disabled={busy || !message.trim() || !contact.trim()} className="btn-primary w-full">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Kirim permintaan konsultasi
      </button>
      <p className="flex items-center gap-1.5 text-center text-xs text-charcoal-muted"><Stethoscope className="h-3.5 w-3.5" /> Layanan konsultasi ahli tanaman — respon dalam 1×24 jam kerja.</p>
    </form>
  );
}
