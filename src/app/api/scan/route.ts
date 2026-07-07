import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { diagnosePlant, type PhotoData } from "@/lib/anthropic";
import { uploadPhoto, fileToBuffer } from "@/lib/storage";
import { aiPhotoType, diagnosisRows, treatmentRows, scanSummary } from "@/lib/scan-mapper";
import type { DiagnosisResult, PlantMode, ScanContext } from "@/lib/types";
import type { DbPhotoType } from "@/lib/db-types";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 8 * 1024 * 1024;
const PHOTO_TYPES: DbPhotoType[] = ["whole_plant", "leaf", "stem", "root", "soil", "other"];

/**
 * POST /api/scan
 * FormData:
 *   photo_<type> | photo : File (whole_plant|leaf|stem|root|soil|other) — minimal 1
 *   mode? general|aroid|bonsai
 *   plant_id? (scan untuk tanaman yang sudah ada)
 *   nickname?, common_name?, location?, pot_size?, growing_medium?,
 *   watering_frequency?, fertilizer_schedule?, light_condition?
 * -> { scan_id, plant_id, result }
 */
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Request tidak valid." }, { status: 400 });
  }

  const mode = (String(form.get("mode") || "general") as PlantMode) || "general";
  const existingPlantId = String(form.get("plant_id") || "").trim();
  const field = (k: string) => String(form.get(k) || "").trim();

  // Kumpulkan foto bertipe + fallback "photo"
  const files: { type: DbPhotoType; file: File }[] = [];
  for (const t of PHOTO_TYPES) {
    const f = form.get(`photo_${t}`);
    if (f instanceof File && f.size > 0) files.push({ type: t, file: f });
  }
  const generic = form.get("photo");
  if (generic instanceof File && generic.size > 0) files.push({ type: "whole_plant", file: generic });

  if (files.length === 0)
    return NextResponse.json({ error: "Minimal unggah satu foto." }, { status: 400 });
  for (const { file } of files) {
    if (file.size > MAX_BYTES)
      return NextResponse.json({ error: "Ukuran foto maksimal 8 MB." }, { status: 400 });
    if (!file.type.startsWith("image/"))
      return NextResponse.json({ error: "File harus berupa gambar." }, { status: 400 });
  }

  // Konteks perawatan opsional -> AI
  const ctx: ScanContext = {
    species_hint: field("nickname") || field("common_name") || undefined,
    location: (field("location") as ScanContext["location"]) || "",
    growing_medium: field("growing_medium") || undefined,
    light_condition: (field("light_condition") as ScanContext["light_condition"]) || "",
  };

  const buffers = await Promise.all(files.map((f) => fileToBuffer(f.file)));
  const photoData: PhotoData[] = files.map((f, i) => ({
    type: aiPhotoType(f.type),
    base64: buffers[i].toString("base64"),
    mime: f.file.type,
  }));

  // 1) AI analysis
  let result: DiagnosisResult;
  try {
    result = await diagnosePlant(photoData, mode, ctx);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal menganalisa gambar.";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
  if (!result.is_plant)
    return NextResponse.json(
      { error: "Gambar tidak terdeteksi sebagai tanaman.", result },
      { status: 422 }
    );

  // 2) Plant (buat baru bila perlu)
  let plantId: string | null = existingPlantId || null;
  if (!plantId) {
    const { data: plant, error } = await supabase
      .from("plants")
      .insert({
        user_id: user.id,
        nickname: field("nickname") || result.species_name,
        common_name: result.species_name,
        scientific_name: result.scientific_name || null,
        category: result.category || null,
        location: field("location") || null,
        pot_size: field("pot_size") || null,
        growing_medium: field("growing_medium") || null,
        watering_frequency: field("watering_frequency") || null,
        fertilizer_schedule: field("fertilizer_schedule") || null,
        light_condition: field("light_condition") || null,
      })
      .select("id")
      .single();
    if (error || !plant)
      return NextResponse.json({ error: `Gagal membuat tanaman: ${error?.message}` }, { status: 500 });
    plantId = plant.id;
  }

  // 3) Scan record
  const { data: scan, error: scanErr } = await supabase
    .from("scans")
    .insert({
      user_id: user.id,
      plant_id: plantId,
      ai_result_json: result,
      ...scanSummary(result),
    })
    .select("id")
    .single();
  if (scanErr || !scan)
    return NextResponse.json({ error: `Gagal menyimpan scan: ${scanErr?.message}` }, { status: 500 });
  const scanId = scan.id;

  // 4) Upload foto -> plant_photos
  try {
    const urls = await Promise.all(files.map((f, i) => uploadPhoto(user.id, buffers[i], f.file.type)));
    await supabase.from("plant_photos").insert(
      files.map((f, i) => ({
        plant_id: plantId,
        scan_id: scanId,
        photo_url: urls[i],
        photo_type: f.type,
      }))
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal mengunggah foto.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  // 5) Diagnoses (per-issue) + treatments
  if (result.issues.length)
    await supabase.from("diagnoses").insert(diagnosisRows(result, scanId, plantId));
  if (result.treatments.length)
    await supabase.from("treatments").insert(treatmentRows(result, plantId!, scanId));

  return NextResponse.json({ scan_id: scanId, plant_id: plantId, result });
}
