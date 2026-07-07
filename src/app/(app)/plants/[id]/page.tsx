import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Camera } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { HealthBadge } from "@/components/HealthBadge";
import { DeletePlantButton } from "@/components/PlantActions";
import { PlantTabs } from "@/components/PlantTabs";
import { isDiagnosisScan } from "@/lib/diagnosis";
import { statusFromScore } from "@/lib/health";
import type { PlantRecord, ScanRecord, PlantPhotoRecord, TreatmentRecord } from "@/lib/db-types";

export const dynamic = "force-dynamic";

export default async function PlantDetailPage({ params, searchParams }: { params: { id: string }; searchParams: { tab?: string } }) {
  const supabase = createClient();

  const { data: plant } = await supabase.from("plants").select("*").eq("id", params.id).single();
  if (!plant) notFound();
  const p = plant as PlantRecord;

  const [{ data: scansData }, { data: photosData }, { data: trData }] = await Promise.all([
    supabase.from("scans").select("*").eq("plant_id", params.id).order("created_at", { ascending: false }),
    supabase.from("plant_photos").select("*").eq("plant_id", params.id).order("uploaded_at", { ascending: false }),
    supabase.from("treatments").select("*").eq("plant_id", params.id).order("created_at", { ascending: false }),
  ]);
  const scans = (scansData || []) as ScanRecord[];
  const photos = (photosData || []) as PlantPhotoRecord[];
  const treatments = (trData || []) as TreatmentRecord[];
  const latest = scans.filter(isDiagnosisScan)[0];
  const cover = photos.find((x) => x.photo_type === "whole_plant")?.photo_url || photos[0]?.photo_url || null;

  return (
    <div className="space-y-6">
      <Link href="/plants" className="inline-flex items-center gap-1.5 text-sm text-charcoal-muted hover:text-leaf-600">
        <ArrowLeft className="h-4 w-4" /> Kembali ke daftar tanaman
      </Link>

      <div className="card flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-3xl bg-sage-100 dark:bg-white/5">
          {cover && <Image src={cover} alt={p.nickname || ""} fill className="object-cover" sizes="96px" />}
        </div>
        <div className="flex-1">
          {p.category && <p className="text-xs uppercase tracking-wide text-leaf-600">{p.category}</p>}
          <h1 className="text-xl font-bold">{p.nickname || p.common_name || "Tanaman"}</h1>
          {p.common_name && <p className="text-sm text-charcoal-muted">{p.common_name}</p>}
          {p.scientific_name && <p className="text-sm italic text-charcoal-muted">{p.scientific_name}</p>}
          {latest && <div className="mt-2"><HealthBadge status={statusFromScore(latest.health_score)} /></div>}
        </div>
        <div className="flex items-center gap-2 self-start">
          <Link href={`/scan?plant=${p.id}`} className="btn-primary"><Camera className="h-4 w-4" /> Diagnosa Ulang</Link>
          <DeletePlantButton plantId={p.id} />
        </div>
      </div>

      <PlantTabs plant={p} scans={scans} photos={photos} treatments={treatments} initialTab={searchParams.tab} />
    </div>
  );
}
