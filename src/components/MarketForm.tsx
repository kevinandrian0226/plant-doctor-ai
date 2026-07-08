"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Store } from "lucide-react";

type PlantOpt = { id: string; name: string; category: string; photo: string };

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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || !title.trim()) return;
    setBusy(true); setError(null);
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plant_id: plantId || null, title, price: Number(price) || 0,
          city, whatsapp, description, photo_url: photo || null,
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
        {photo && <div className="mt-2 h-28 w-28 overflow-hidden rounded-2xl bg-sage-100"><img src={photo} alt="" className="h-full w-full object-cover" /></div>}
      </div>
      <div><label className="label">Judul iklan</label><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="mis. Monstera Thai Constellation" className="input" required /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">Harga (Rp)</label><input value={price} onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" placeholder="500000" className="input" /></div>
        <div><label className="label">Kota</label><input value={city} onChange={(e) => setCity(e.target.value)} placeholder="mis. Jakarta" className="input" /></div>
      </div>
      <div><label className="label">Nomor WhatsApp</label><input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} inputMode="tel" placeholder="mis. 08123456789" className="input" /></div>
      <div><label className="label">Deskripsi</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Kondisi, ukuran, jumlah daun, dll." className="input" /></div>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-300">{error}</p>}
      <button type="submit" disabled={busy || !title.trim()} className="btn-primary w-full">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Store className="h-4 w-4" />} Pasang iklan
      </button>
    </form>
  );
}
