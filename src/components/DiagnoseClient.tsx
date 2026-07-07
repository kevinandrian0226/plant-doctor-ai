"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, X, Plus, ChevronDown, Sprout, Camera } from "lucide-react";
import { PLANT_MODE_META, LIGHT_META, LOCATION_META, cn } from "@/lib/utils";
import type { PlantMode } from "@/lib/types";

interface ApiResponse { scan_id?: string; plant_id?: string; error?: string }

const PHOTO_SLOTS: { type: string; label: string; emoji: string }[] = [
  { type: "whole_plant", label: "Seluruh Tanaman", emoji: "🪴" },
  { type: "leaf", label: "Daun Close-up", emoji: "🍃" },
  { type: "stem", label: "Batang / Petiol", emoji: "🌱" },
  { type: "soil", label: "Media Tanam", emoji: "🟤" },
  { type: "root", label: "Akar (opsional)", emoji: "🫚" },
];
const MODES: PlantMode[] = ["general", "aroid", "bonsai"];
const LIGHTS: (keyof typeof LIGHT_META)[] = ["low", "medium", "bright", "direct"];
const LOADING_TEXT = "AI sedang membaca jenis tanaman, gejala daun, kemungkinan hama, dan kondisi media.";

export function DiagnoseClient({ plantId, defaultMode = "general" }: { plantId?: string; defaultMode?: PlantMode }) {
  const router = useRouter();
  const [files, setFiles] = useState<Record<string, File>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [mode, setMode] = useState<PlantMode>(defaultMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showCtx, setShowCtx] = useState(false);
  const [nickname, setNickname] = useState("");
  const [location, setLocation] = useState<"" | "indoor" | "outdoor">("");
  const [light, setLight] = useState<"" | keyof typeof LIGHT_META>("");
  const [watering, setWatering] = useState("");
  const [fertilizer, setFertilizer] = useState("");
  const [potSize, setPotSize] = useState("");
  const [medium, setMedium] = useState("");

  const inputs = useRef<Record<string, HTMLInputElement | null>>({});

  function pick(type: string, f: File | undefined) {
    if (!f) return;
    if (!f.type.startsWith("image/")) { setError("File harus berupa gambar."); return; }
    setError(null);
    setFiles((p) => ({ ...p, [type]: f }));
    setPreviews((p) => ({ ...p, [type]: URL.createObjectURL(f) }));
  }
  function clearPhoto(type: string) {
    setFiles((p) => { const n = { ...p }; delete n[type]; return n; });
    setPreviews((p) => { const n = { ...p }; delete n[type]; return n; });
  }

  const photoCount = Object.keys(files).length;

  async function submit() {
    if (photoCount === 0) return;
    setLoading(true); setError(null);
    try {
      const form = new FormData();
      form.append("mode", mode);
      if (plantId) form.append("plant_id", plantId);
      if (nickname) { form.append("nickname", nickname); form.append("common_name", nickname); }
      if (location) form.append("location", location);
      if (light) form.append("light_condition", light);
      if (watering) form.append("watering_frequency", watering);
      if (fertilizer) form.append("fertilizer_schedule", fertilizer);
      if (potSize) form.append("pot_size", potSize);
      if (medium) form.append("growing_medium", medium);
      PHOTO_SLOTS.forEach((s) => { if (files[s.type]) form.append(`photo_${s.type}`, files[s.type]); });

      const res = await fetch("/api/scan", { method: "POST", body: form });
      const data: ApiResponse = await res.json();
      if (!res.ok || !data.scan_id) { setError(data.error || "Gagal menganalisa. Coba lagi."); setLoading(false); return; }
      router.push(`/scan/result/${data.scan_id}`);
    } catch { setError("Terjadi kesalahan jaringan. Coba lagi."); setLoading(false); }
  }

  if (loading) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-5 py-20 text-center">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-leaf-200 opacity-60 dark:bg-leaf-800" />
          <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-leaf-700 text-white"><Sprout className="h-9 w-9" /></span>
        </div>
        <div className="flex items-center gap-2 text-leaf-700 dark:text-leaf-300">
          <Loader2 className="h-4 w-4 animate-spin" /><span className="text-sm font-semibold">Menganalisa...</span>
        </div>
        <p className="text-sm leading-relaxed text-charcoal-muted">{LOADING_TEXT}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Scan Tanaman</h1>
        <p className="text-sm text-charcoal-muted">Unggah 1-5 foto. Makin lengkap (daun, batang, media, akar), makin akurat diagnosanya.</p>
      </div>

      {plantId && (
        <div className="card flex items-start gap-3 border border-leaf-200 bg-leaf-50 dark:border-leaf-800 dark:bg-leaf-900/20">
          <Camera className="mt-0.5 h-5 w-5 shrink-0 text-leaf-600" />
          <p className="text-sm text-leaf-800 dark:text-leaf-300">Diagnosa ulang tanaman ini. Tambahkan foto sudut lain untuk hasil lebih akurat.</p>
        </div>
      )}

      {!plantId && (
        <div>
          <p className="label">Mode Analisa</p>
          <div className="grid grid-cols-3 gap-2">
            {MODES.map((m) => {
              const meta = PLANT_MODE_META[m]; const active = mode === m;
              return (
                <button key={m} type="button" onClick={() => setMode(m)}
                  className={cn("rounded-2xl border p-3 text-center transition", active ? "border-leaf-500 bg-leaf-50 ring-2 ring-leaf-200 dark:bg-leaf-900/30 dark:ring-leaf-800" : "border-sage-200 hover:border-leaf-300 dark:border-gray-700")}>
                  <div className="text-xl">{meta.emoji}</div><div className="text-sm font-semibold">{meta.label}</div>
                </button>
              );
            })}
          </div>
          <p className="mt-1.5 text-xs text-charcoal-muted">{PLANT_MODE_META[mode].desc}</p>
        </div>
      )}

      <div>
        <p className="label">Foto Tanaman (1-5)</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {PHOTO_SLOTS.map((slot) => {
            const preview = previews[slot.type];
            return (
              <div key={slot.type}>
                <input ref={(el) => { inputs.current[slot.type] = el; }} type="file" accept="image/*" className="hidden" onChange={(e) => pick(slot.type, e.target.files?.[0])} />
                <button type="button" onClick={() => inputs.current[slot.type]?.click()}
                  className={cn("relative flex aspect-square w-full flex-col items-center justify-center gap-1 overflow-hidden rounded-2xl border-2 border-dashed text-center transition", preview ? "border-leaf-400" : "border-sage-200 hover:border-leaf-400 hover:bg-leaf-50/40 dark:border-gray-700")}>
                  {preview ? (
                    <>
                      <Image src={preview} alt={slot.label} fill className="object-cover" sizes="160px" />
                      <span onClick={(e) => { e.stopPropagation(); clearPhoto(slot.type); }} className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"><X className="h-3.5 w-3.5" /></span>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl">{slot.emoji}</span>
                      <span className="px-1 text-xs font-medium leading-tight">{slot.label}</span>
                      <span className="flex items-center gap-0.5 text-[10px] text-charcoal-muted"><Plus className="h-2.5 w-2.5" /> tambah</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
        <p className="mt-1.5 text-xs text-charcoal-muted">{photoCount > 0 ? `${photoCount} foto dipilih` : "Minimal 1 foto"} - maks 8 MB/foto</p>
      </div>

      {!plantId && (
        <div className="rounded-3xl border border-black/5 dark:border-white/10">
          <button type="button" onClick={() => setShowCtx((v) => !v)} className="flex w-full items-center justify-between p-4 text-left">
            <div><p className="text-sm font-semibold">Data tambahan (opsional)</p><p className="text-xs text-charcoal-muted">Bantu AI memberi diagnosa lebih akurat</p></div>
            <ChevronDown className={cn("h-5 w-5 text-gray-400 transition", showCtx && "rotate-180")} />
          </button>
          {showCtx && (
            <div className="space-y-4 border-t border-black/5 p-4 dark:border-white/10">
              <div>
                <label className="label" htmlFor="nickname">Nama tanaman (jika tahu)</label>
                <input id="nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="mis. Monstera Thai Constellation" className="input" />
              </div>
              <div>
                <p className="label">Lokasi tanaman</p>
                <div className="grid grid-cols-2 gap-2">
                  {(["indoor", "outdoor"] as const).map((loc) => (
                    <button key={loc} type="button" onClick={() => setLocation((p) => (p === loc ? "" : loc))}
                      className={cn("rounded-2xl border p-2.5 text-sm font-medium transition", location === loc ? "border-leaf-500 bg-leaf-50 dark:bg-leaf-900/30" : "border-sage-200 dark:border-gray-700")}>
                      {LOCATION_META[loc].emoji} {LOCATION_META[loc].label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="label">Kondisi cahaya</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {LIGHTS.map((l) => (
                    <button key={l} type="button" onClick={() => setLight((p) => (p === l ? "" : l))}
                      className={cn("rounded-2xl border p-2 text-center text-xs font-medium transition", light === l ? "border-leaf-500 bg-leaf-50 dark:bg-leaf-900/30" : "border-sage-200 dark:border-gray-700")}>
                      <div className="text-base">{LIGHT_META[l].emoji}</div>{LIGHT_META[l].label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="label" htmlFor="wf">Frekuensi siram</label><input id="wf" value={watering} onChange={(e) => setWatering(e.target.value)} placeholder="mis. tiap 3 hari" className="input" /></div>
                <div><label className="label" htmlFor="fs">Jadwal pupuk</label><input id="fs" value={fertilizer} onChange={(e) => setFertilizer(e.target.value)} placeholder="mis. tiap 2 minggu" className="input" /></div>
                <div><label className="label" htmlFor="ps">Ukuran pot</label><input id="ps" value={potSize} onChange={(e) => setPotSize(e.target.value)} placeholder="mis. 15 cm" className="input" /></div>
                <div><label className="label" htmlFor="gm">Media tanam</label><input id="gm" value={medium} onChange={(e) => setMedium(e.target.value)} placeholder="mis. moss + perlite" className="input" /></div>
              </div>
            </div>
          )}
        </div>
      )}

      {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-300">{error}</p>}
      <button onClick={submit} disabled={photoCount === 0} className="btn-primary w-full"><Sparkles className="h-4 w-4" /> Analyze</button>
    </div>
  );
}
