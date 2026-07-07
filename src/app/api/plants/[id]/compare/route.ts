import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { compareRecovery, type PhotoData } from "@/lib/anthropic";
import { uploadPhoto, fileToBuffer } from "@/lib/storage";
import type { DiagnosisResult } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 8 * 1024 * 1024;

/**
 * POST /api/plants/[id]/compare -> bandingkan foto lama vs foto baru
 * FormData: photo (File baru)
 * Membandingkan dengan scan terakhir tanaman; menyimpan scan follow-up + foto.
 * -> { comparison, scan_id, photo_url }
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });

  const { data: plant } = await supabase
    .from("plants")
    .select("id")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();
  if (!plant) return NextResponse.json({ error: "Tanaman tidak ditemukan." }, { status: 404 });

  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Request tidak valid." }, { status: 400 });

  const file = form.get("photo");
  if (!(file instanceof File) || file.size === 0)
    return NextResponse.json({ error: "Foto baru wajib diunggah." }, { status: 400 });
  if (file.size > MAX_BYTES)
    return NextResponse.json({ error: "Foto maksimal 8 MB." }, { status: 400 });

  // Scan terakhir sebagai pembanding
  const { data: prevScan } = await supabase
    .from("scans")
    .select("*")
    .eq("plant_id", params.id)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  if (!prevScan)
    return NextResponse.json(
      { error: "Belum ada scan sebelumnya untuk dibandingkan." },
      { status: 400 }
    );

  const prevResult = (prevScan.ai_result_json || {}) as Partial<DiagnosisResult>;
  const buffer = await fileToBuffer(file);
  const photoData: PhotoData[] = [
    { type: "whole", base64: buffer.toString("base64"), mime: file.type },
  ];

  let comparison;
  try {
    comparison = await compareRecovery(photoData, {
      summary: prevScan.summary || prevResult.summary || "",
      health_score: prevScan.health_score || prevResult.health_score || 0,
      issues: (prevResult.issues || []).map((i) => i.name),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal membandingkan kondisi.";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  // Simpan scan follow-up
  const { data: scan } = await supabase
    .from("scans")
    .insert({
      user_id: user.id,
      plant_id: params.id,
      status: "completed",
      ai_result_json: { recovery: comparison, vs_scan_id: prevScan.id },
      health_score: comparison.health_score,
      summary: comparison.summary,
    })
    .select("id")
    .single();

  // Upload & catat foto baru
  let photoUrl: string | null = null;
  try {
    photoUrl = await uploadPhoto(user.id, buffer, file.type);
    await supabase.from("plant_photos").insert({
      plant_id: params.id,
      scan_id: scan?.id ?? null,
      photo_url: photoUrl,
      photo_type: "whole_plant",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal mengunggah foto.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return NextResponse.json({ comparison, scan_id: scan?.id, photo_url: photoUrl });
}
