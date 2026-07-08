import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateCareGuide } from "@/lib/anthropic";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });

  const { data: plant } = await supabase
    .from("plants").select("*").eq("id", params.id).eq("user_id", user.id).maybeSingle();
  if (!plant) return NextResponse.json({ error: "Tanaman tidak ditemukan." }, { status: 404 });

  try {
    const guide = await generateCareGuide({
      name: plant.nickname || plant.common_name || "Tanaman",
      scientificName: plant.scientific_name || undefined,
      category: plant.category || undefined,
    });
    await supabase.from("plants").update({ care_guide: guide }).eq("id", params.id).eq("user_id", user.id);
    return NextResponse.json({ guide });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal membuat panduan.";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
