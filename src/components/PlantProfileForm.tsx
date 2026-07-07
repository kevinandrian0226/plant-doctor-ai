"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, Check } from "lucide-react";
import type { PlantRecord } from "@/lib/db-types";

export function PlantProfileForm({ plant }: { plant: PlantRecord }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [f, setF] = useState({
    nickname: plant.nickname || "", common_name: plant.common_name || "", scientific_name: plant.scientific_name || "",
    category: plant.category || "", location: plant.location || "", pot_size: plant.pot_size || "",
    growing_medium: plant.growing_medium || "", watering_frequency: plant.watering_frequency || "",
    fertilizer_schedule: plant.fertilizer_schedule || "", light_condition: plant.light_condition || "",
  });
  const set = (k: string, v: string) => { setF((p) => ({ ...p, [k]: v })); setSaved(false); };

  async function save() {
    setSaving(true);
    const payload: Record<string, unknown> = {};
    Object.entries(f).forEach(([k, v]) => (payload[k] = v || null));
    const res = await fetch(`/api/plants/${plant.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSaving(false);
    if (res.ok) { setSaved(true); router.refresh(); setTimeout(() => setSaved(false), 2000); }
  }

  const F = ({ k, label, ph }: { k: keyof typeof f; label: string; ph?: string }) => (
    <div><label className="label">{label}</label><input className="input" value={f[k]} placeholder={ph} onChange={(e) => set(k, e.target.value)} /></div>
  );

  return (
    <div className="card space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <F k="nickname" label="Nama panggilan" />
        <F k="common_name" label="Nama umum" ph="mis. Monstera Deliciosa" />
        <F k="scientific_name" label="Nama ilmiah" />
        <F k="category" label="Kategori" ph="aroid / bonsai / sukulen" />
        <F k="location" label="Lokasi" ph="indoor / outdoor / teras" />
        <F k="pot_size" label="Ukuran pot" ph="mis. 15 cm" />
        <F k="growing_medium" label="Media tanam" ph="mis. moss + perlite" />
        <F k="light_condition" label="Kondisi cahaya" ph="low / medium / bright / direct" />
        <F k="watering_frequency" label="Frekuensi siram" ph="mis. tiap 3 hari" />
        <F k="fertilizer_schedule" label="Jadwal pupuk" ph="mis. tiap 2 minggu" />
      </div>
      <button onClick={save} disabled={saving} className="btn-primary">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
        {saving ? "Menyimpan..." : saved ? "Tersimpan" : "Simpan Profil"}
      </button>
    </div>
  );
}
