import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Masuk dulu untuk menyukai." }, { status: 401 });

  const { data: plant } = await supabase
    .from("plants")
    .select("id, is_public, user_id")
    .eq("id", params.id)
    .maybeSingle();
  if (!plant || (!plant.is_public && plant.user_id !== user.id))
    return NextResponse.json({ error: "Tanaman tidak ditemukan." }, { status: 404 });

  const { data: existing } = await supabase
    .from("plant_likes")
    .select("id")
    .eq("plant_id", params.id)
    .eq("user_id", user.id)
    .maybeSingle();

  let liked: boolean;
  if (existing) {
    await supabase.from("plant_likes").delete().eq("id", existing.id);
    liked = false;
  } else {
    await supabase.from("plant_likes").insert({ plant_id: params.id, user_id: user.id });
    liked = true;
  }

  const { count } = await supabase
    .from("plant_likes")
    .select("id", { count: "exact", head: true })
    .eq("plant_id", params.id);

  return NextResponse.json({ liked, count: count ?? 0 });
}
