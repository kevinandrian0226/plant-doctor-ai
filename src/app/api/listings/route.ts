import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });

  const b = await request.json().catch(() => null);
  const title = typeof b?.title === "string" ? b.title.slice(0, 160).trim() : "";
  if (!title) return NextResponse.json({ error: "Judul wajib diisi." }, { status: 400 });

  const price = Math.max(0, Math.round(Number(b?.price) || 0));
  if (price <= 0) return NextResponse.json({ error: "Harga harus lebih dari 0." }, { status: 400 });

  const whatsapp = typeof b?.whatsapp === "string" ? b.whatsapp.replace(/\D/g, "").slice(0, 20) : "";
  if (whatsapp.length < 8) return NextResponse.json({ error: "Nomor WhatsApp wajib diisi (min. 8 digit)." }, { status: 400 });

  let plantId: string | null = null;
  let photoUrl: string | null = null;
  if (typeof b?.plant_id === "string" && b.plant_id) {
    const { data: plant } = await supabase
      .from("plants").select("id").eq("id", b.plant_id).eq("user_id", user.id).maybeSingle();
    if (plant) {
      plantId = plant.id;
      const { data: ph } = await supabase
        .from("plant_photos").select("photo_url, photo_type").eq("plant_id", plant.id);
      const rows = (ph || []) as { photo_url: string; photo_type: string }[];
      photoUrl = rows.find((r) => r.photo_type === "whole_plant")?.photo_url || rows[0]?.photo_url || null;
    }
  }

  const { data, error } = await supabase.from("listings").insert({
    user_id: user.id,
    plant_id: plantId,
    title,
    price,
    description: typeof b?.description === "string" ? b.description.slice(0, 2000).trim() : null,
    photo_url: photoUrl,
    whatsapp,
    city: typeof b?.city === "string" ? b.city.slice(0, 80).trim() : null,
  }).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
