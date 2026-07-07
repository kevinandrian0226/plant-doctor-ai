import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, AlertTriangle, Plus, ScanLine } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DiagnosisResultView } from "@/components/DiagnosisResultView";
import { ResultActions } from "@/components/ResultActions";
import { scanResult } from "@/lib/diagnosis";
import { formatDate } from "@/lib/utils";
import type { ScanRecord, PlantRecord, PlantPhotoRecord } from "@/lib/db-types";

export const dynamic = "force-dynamic";

export default async function ScanResultPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: scan } = await supabase.from("scans").select("*").eq("id", params.id).single();
  if (!scan || (user && scan.user_id !== user.id)) notFound();
  const s = scan as ScanRecord;
  const result = scanResult(s);

  const [{ data: plant }, { data: photos }] = await Promise.all([
    s.plant_id ? supabase.from("plants").select("*").eq("id", s.plant_id).single() : Promise.resolve({ data: null }),
    supabase.from("plant_photos").select("*").eq("scan_id", params.id),
  ]);
  const p = plant as PlantRecord | null;
  const photoList = (photos || []) as PlantPhotoRecord[];
  const cover = photoList.find((x) => x.photo_type === "whole_plant")?.photo_url || photoList[0]?.photo_url || null;
  const plantName = p?.nickname || p?.common_name || result?.species_name || "Tanaman";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Link href={s.plant_id ? `/plants/${s.plant_id}` : "/plants"} className="inline-flex items-center gap-1.5 text-sm text-charcoal-muted hover:text-leaf-600">
          <ArrowLeft className="h-4 w-4" /> {plantName}
        </Link>
        <Link href="/scan" className="btn-secondary px-4 py-2 text-sm"><ScanLine className="h-4 w-4" /> Scan Lagi</Link>
      </div>

      <div>
        <h1 className="text-xl font-bold">Hasil Diagnosa</h1>
        <p className="text-xs text-charcoal-muted">{formatDate(s.created_at)}</p>
      </div>

      {result?.uncertain && s.plant_id && (
        <div className="card border border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20">
          <p className="flex items-center gap-2 text-sm font-semibold text-amber-800 dark:text-amber-200">
            <AlertTriangle className="h-4 w-4" /> Foto kurang jelas untuk diagnosa pasti
          </p>
          <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">Tambahkan foto sudut lain (daun, batang, akar, media) lalu analisa ulang.</p>
          <Link href={`/scan?plant=${s.plant_id}`} className="btn-primary mt-3"><Plus className="h-4 w-4" /> Tambah Foto & Analisa Ulang</Link>
        </div>
      )}

      {result ? (
        <>
          {s.plant_id && <ResultActions plantId={s.plant_id} result={result} plantName={plantName} />}
          <DiagnosisResultView result={result} photoUrl={cover} />
        </>
      ) : (
        <div className="card"><p className="text-sm text-charcoal-muted">{s.summary || "Hasil tidak tersedia."}</p></div>
      )}

      {s.plant_id && (
        <Link href={`/plants/${s.plant_id}`} className="flex items-center justify-center gap-1.5 text-sm font-semibold text-leaf-600 hover:underline">
          Lihat profil & riwayat tanaman →
        </Link>
      )}
    </div>
  );
}
