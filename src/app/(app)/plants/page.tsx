import Link from "next/link";
import { Plus, Sprout, ScanLine } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PlantsExplorer, type PlantListItem } from "@/components/PlantsExplorer";
import { EmptyState } from "@/components/ui/States";
import { isDiagnosisScan } from "@/lib/diagnosis";
import { statusFromScore } from "@/lib/health";
import type { PlantRecord, ScanRecord, PlantPhotoRecord } from "@/lib/db-types";

export const dynamic = "force-dynamic";

export default async function PlantsPage() {
  const supabase = createClient();
  const [{ data: pData }, { data: sData }, { data: phData }] = await Promise.all([
    supabase.from("plants").select("*").order("updated_at", { ascending: false }),
    supabase.from("scans").select("*").order("created_at", { ascending: false }),
    supabase.from("plant_photos").select("*").order("uploaded_at", { ascending: false }),
  ]);
  const plants = (pData || []) as PlantRecord[];
  const scans = (sData || []) as ScanRecord[];
  const photos = (phData || []) as PlantPhotoRecord[];

  const latestScan = new Map<string, ScanRecord>();
  const counts = new Map<string, number>();
  for (const s of scans) {
    if (!s.plant_id || !isDiagnosisScan(s)) continue;
    counts.set(s.plant_id, (counts.get(s.plant_id) || 0) + 1);
    if (!latestScan.has(s.plant_id)) latestScan.set(s.plant_id, s);
  }
  const cover = new Map<string, string>();
  for (const ph of photos) if (!cover.has(ph.plant_id)) cover.set(ph.plant_id, ph.photo_url);

  const items: PlantListItem[] = plants.map((p) => {
    const sc = latestScan.get(p.id);
    return {
      id: p.id, name: p.nickname || p.common_name || "Tanaman", species: p.common_name, scientific: p.scientific_name,
      category: p.category, cover: cover.get(p.id) || null,
      status: sc ? statusFromScore(sc.health_score) : "unknown", risk: sc?.risk_level ?? null,
      updated_at: p.updated_at, diagnosis_count: counts.get(p.id) || 0,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tanaman Saya</h1>
          <p className="text-sm text-charcoal-muted">Semua koleksi, diagnosis, dan progress pemulihan.</p>
        </div>
        <Link href="/scan" className="btn-primary"><Plus className="h-4 w-4" /> Scan</Link>
      </div>
      {items.length === 0 ? (
        <EmptyState icon={Sprout} title="Belum ada tanaman" description="Mulai dengan scan tanaman pertamamu untuk membangun koleksi & riwayat kesehatannya." action={{ label: "Scan Tanaman Pertama", href: "/scan", icon: ScanLine }} />
      ) : (
        <PlantsExplorer plants={items} />
      )}
    </div>
  );
}
