import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * GET /api/scan/[id] -> hasil scan lengkap (scan + diagnoses + foto)
 */
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });

  const { data: scan } = await supabase
    .from("scans")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!scan || scan.user_id !== user.id)
    return NextResponse.json({ error: "Scan tidak ditemukan." }, { status: 404 });

  const [{ data: diagnoses }, { data: photos }] = await Promise.all([
    supabase
      .from("diagnoses")
      .select("*")
      .eq("scan_id", params.id)
      .order("confidence", { ascending: false }),
    supabase
      .from("plant_photos")
      .select("*")
      .eq("scan_id", params.id)
      .order("uploaded_at", { ascending: true }),
  ]);

  return NextResponse.json({
    scan,
    result: scan.ai_result_json,
    diagnoses: diagnoses || [],
    photos: photos || [],
  });
}
