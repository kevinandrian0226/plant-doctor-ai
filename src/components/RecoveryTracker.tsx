"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Camera, Loader2, X, RefreshCw, ArrowRight } from "lucide-react";
import { BeforeAfter } from "./BeforeAfter";
import { RECOVERY_META, cn } from "@/lib/utils";
import type { RecoveryResult } from "@/lib/types";

export function RecoveryTracker({
  plantId, hasPrevious, previousPhoto, previousScore,
}: { plantId: string; hasPrevious: boolean; previousPhoto?: string | null; previousScore?: number }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RecoveryResult | null>(null);

  function pick(f: File | undefined) {
    if (!f) return;
    if (!f.type.startsWith("image/")) return setError("File harus gambar.");
    setError(null); setFile(f); setPreview(URL.createObjectURL(f)); setResult(null);
  }
  async function submit() {
    if (!file) return;
    setLoading(true); setError(null);
    try {
      const fd = new FormData();
      fd.append("photo", file);
      const res = await fetch(`/api/plants/${plantId}/compare`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Gagal membandingkan.");
      else { setResult(data.comparison); router.refresh(); }
    } catch { setError("Kesalahan jaringan."); } finally { setLoading(false); }
  }
  function reset() { setFile(null); setPreview(null); setResult(null); setError(null); }

  if (!hasPrevious) return <div className="card text-center text-sm text-charcoal-muted">Lakukan diagnosa dulu sebelum melacak pemulihan.</div>;

  if (result) {
    const meta = RECOVERY_META[result.trend];
    return (
      <div className="space-y-4">
        <BeforeAfter beforeUrl={previousPhoto} afterUrl={preview} beforeScore={previousScore} afterScore={result.health_score} />
        <div className={cn("card flex items-center gap-3", meta.bg)}>
          <span className="text-2xl">{meta.emoji}</span>
          <div><p className={cn("text-base font-bold", meta.color)}>{meta.label}</p><p className="text-sm text-charcoal-muted">{result.summary}</p></div>
        </div>
        {result.changes.length > 0 && (
          <div className="card"><p className="mb-2 text-sm font-semibold text-charcoal-muted">Perubahan yang terlihat</p>
            <ul className="space-y-1.5">{result.changes.map((c, i) => <li key={i} className="flex items-start gap-2 text-sm text-charcoal dark:text-gray-200"><ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-leaf-500" /> {c}</li>)}</ul>
          </div>
        )}
        {result.next_actions.length > 0 && (
          <div className="card bg-leaf-50/60 dark:bg-leaf-900/20"><p className="mb-2 text-sm font-semibold text-leaf-800 dark:text-leaf-300">Langkah berikutnya</p>
            <ul className="space-y-1.5">{result.next_actions.map((c, i) => <li key={i} className="text-sm text-charcoal dark:text-gray-200">• {c}</li>)}</ul>
          </div>
        )}
        <button onClick={reset} className="btn-secondary w-full"><RefreshCw className="h-4 w-4" /> Bandingkan Foto Lain</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-charcoal-muted">Unggah foto terbaru. AI membandingkan dengan diagnosa terakhir dan menilai apakah tanaman <strong>membaik, stabil, memburuk,</strong> atau <strong>butuh tindakan</strong>.</p>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
      <div onClick={() => !loading && inputRef.current?.click()} className="card cursor-pointer border-2 border-dashed border-sage-200 text-center transition hover:border-leaf-400 dark:border-leaf-800">
        {preview ? (
          <div className="relative mx-auto h-56 w-full max-w-xs overflow-hidden rounded-2xl">
            <Image src={preview} alt="Foto follow-up" fill className="object-cover" sizes="320px" />
            <button onClick={(e) => { e.stopPropagation(); reset(); }} className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white"><X className="h-4 w-4" /></button>
          </div>
        ) : (
          <div className="py-8"><Camera className="mx-auto mb-2 h-8 w-8 text-leaf-500" /><p className="text-sm font-semibold">Ketuk untuk pilih foto follow-up</p></div>
        )}
      </div>
      {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-300">{error}</p>}
      <button onClick={submit} disabled={!file || loading} className="btn-primary w-full">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}{loading ? "Membandingkan..." : "Bandingkan Kondisi"}
      </button>
    </div>
  );
}
