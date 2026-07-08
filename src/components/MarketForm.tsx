"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Store } from "lucide-react";

type PlantOpt = { id: string; name: string; category: string; photo: string };

const TITLE_MAX = 160;
const DESC_MAX = 2000;

export function MarketForm({ plants }: { plants: PlantOpt[] }) {
  const router = useRouter();
  const [plantId, setPlantId] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [city, setCity] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = (id: string) => {
    setPlantId(id);
    const p = plants.find((x) => x.id === id);
    if (p && !title) setTitle(p.name);
  };
  const photo = plants.find((p) => p.id === plantId)?.photo || "";
  const priceDisplay = price ? Number(price).toLocaleString("id-ID") : "";
  const waDigits = whatsapp.replace(/\D/g, "");
  const canSubmit = !!title.trim() && waDigits.length >= 8 && Number(price) > 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (!title.trim()) { setError("Judul iklan wajib diisi."); return; }
    if (Number(price) <= 0) { setError("Harga harus lebih dari 0."); return; }
    if (waDigits.length < 8) { setError("Nomor WhatsApp wajib diisi (min. 8 digit)."); return; }
    setBusy(true); setError(null);
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plant_id: plantId || null, title: title.trim(), price: Number(price) || 0,
          city: city.trim(), whatsapp: waDigits, description: description.trim(), photo_url: photo || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error);
      router.push(`/market/${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memasang iklan.");
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="card space-y-4">
      <div>
        <label className="label">Ambil dari koleksi (opsional — untuk foto)</label>
        <select value={plantId} onChange={(e) => pick(e.target.value)} className="input">
          <option value="">— Tanpa foto / manual —</option>
          {plants.map((p) => <option key={p.id} value={p.id}>{p.name}{p.category ? ` (${p.category})` : ""}</option>)}
        </select>
        {photo && (
          <div className="relative mt-2 h-28 w-28 overflow-hidden rounded-2xl bg-sage-100">
            <Image src={photo} alt="Foto tanaman" fill className="object-cover" sizes="112px" />
          </div>
        )}
      </div>
      <div>
        <div className="flex items-baseline justify-between"><label className="label">Judul iklan</label><span className="text-[11px] text-charcoal-muted">{title.length}/{TITLE_MAX}</span></div>
        <input value={title} maxLength={TITLE_MAX} onChange={(e) => setTitle(e.target.value)} placeholder="mis. Monstera Thai Constellation" className="input" required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">Harga (Rp)</label><input value={priceDisplay} onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" placeholder="500.000" className="input" required /></div>
        <div><label className="label">Kota</label><input value={city} onChange={(e) => setCity(e.target.value)} placeholder="mis. Jakarta" className="input" /></div>
      </div>
      <div><label className="label">Nomor WhatsApp</label><input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} inputMode="tel" placeholder="mis. 08123456789" className="input" required /></div>
      <div>
        <div className="flex items-baseline justify-between"><label className="label">Deskripsi</label><span className="text-[11px] text-charcoal-muted">{description.length}/{DESC_MAX}</span></div>
        <textarea value={description} maxLength={DESC_MAX} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Kondisi, ukuran, jumlah daun, dll." className="input" />
      </div>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-300">{error}</p>}
      <button type="submit" disabled={busy || !canSubmit} className="btn-primary w-full">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Store className="h-4 w-4" />} Pasang iklan
      </button>
    </form>
  );
}
