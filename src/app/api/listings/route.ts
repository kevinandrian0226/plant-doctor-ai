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

  const { data, error } = await supabase.from("listings").insert({
    user_id: user.id,
    plant_id: b?.plant_id || null,
    title,
    price: Math.max(0, Math.round(Number(b?.price) || 0)),
    description: typeof b?.description === "string" ? b.description.slice(0, 2000) : null,
    photo_url: typeof b?.photo_url === "string" ? b.photo_url : null,
    whatsapp: typeof b?.whatsapp === "string" ? b.whatsapp.slice(0, 40) : null,
    city: typeof b?.city === "string" ? b.city.slice(0, 80) : null,
  }).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
