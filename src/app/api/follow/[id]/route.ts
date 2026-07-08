import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Masuk dulu." }, { status: 401 });
  if (user.id === params.id) return NextResponse.json({ error: "Tidak bisa mengikuti diri sendiri." }, { status: 400 });

  const { data: existing } = await supabase.from("follows").select("id").eq("follower_id", user.id).eq("following_id", params.id).maybeSingle();
  let following: boolean;
  if (existing) { await supabase.from("follows").delete().eq("id", existing.id); following = false; }
  else { await supabase.from("follows").insert({ follower_id: user.id, following_id: params.id }); following = true; }
  return NextResponse.json({ following });
}
