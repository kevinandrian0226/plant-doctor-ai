import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const message = typeof body?.message === "string" ? body.message.slice(0, 2000) : "";
  if (!message.trim()) return NextResponse.json({ error: "Pesan wajib diisi." }, { status: 400 });

  const { error } = await supabase.from("consult_requests").insert({
    user_id: user.id,
    plant_id: body?.plant_id || null,
    topic: typeof body?.topic === "string" ? body.topic.slice(0, 120) : null,
    contact: typeof body?.contact === "string" ? body.contact.slice(0, 200) : null,
    message,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
