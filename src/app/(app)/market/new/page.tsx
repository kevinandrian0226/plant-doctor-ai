import { createClient } from "@/lib/supabase/server";
import { MarketForm } from "@/components/MarketForm";
import type { PlantRecord, PlantPhotoRecord } from "@/lib/db-types";

export const dynamic = "force-dynamic";

export default async function NewListingPage() {
  const supabase = createClient();
  const { data: pData } = await supabase.from("plants").select("id, nickname, common_name, category").order("updated_at", { ascending: false });
  const plants = (pData || []) as Partial<PlantRecord>[];
  const ids = plants.map((p) => p.id as string);
  let photos: Partial<PlantPhotoRecord>[] = [];
  if (ids.length) {
    const { data } = await supabase.from("plant_photos").select("plant_id, photo_url, photo_type").in("plant_id", ids);
    photos = (data || []) as Partial<PlantPhotoRecord>[];
  }
  const coverBy: Record<string, string> = {};
  for (const ph of photos) {
    if (!ph.plant_id || !ph.photo_url) continue;
    if (ph.photo_type === "whole_plant") coverBy[ph.plant_id] = ph.photo_url;
    else if (!coverBy[ph.plant_id]) coverBy[ph.plant_id] = ph.photo_url;
  }
  const options = plants.map((p) => ({
    id: p.id as string,
    name: (p.nickname || p.common_name || "Tanaman") as string,
    category: (p.category || "") as string,
    photo: coverBy[p.id as string] || "",
  }));

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="display-title text-3xl">Pasang Iklan</h1>
        <p className="mt-1 text-sm text-charcoal-muted">Jual tanamanmu ke sesama kolektor. Pembeli menghubungi via WhatsApp.</p>
      </div>
      <MarketForm plants={options} />
    </div>
  );
}
