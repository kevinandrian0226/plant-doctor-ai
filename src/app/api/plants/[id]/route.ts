import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PLANT_FIELDS } from "@/lib/db-types";

export const runtime = "nodejs";

// GET /api/plants/[id] -> detail tanaman + foto, scan, treatment, reminder
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });

  const { data: plant } = await supabase
    .from("plants")
    .select("*")
    .eq("id", params.id)
    .single();
  if (!plant) return NextResponse.json({ error: "Tanaman tidak ditemukan." }, { status: 404 });

  const [{ data: photos }, { data: scans }, { data: treatments }, { data: reminders }] =
    await Promise.all([
      supabase.from("plant_photos").select("*").eq("plant_id", params.id).order("uploaded_at", { ascending: false }),
      supabase.from("scans").select("*").eq("plant_id", params.id).order("created_at", { ascending: false }),
      supabase.from("treatments").select("*").eq("plant_id", params.id).order("created_at", { ascending: false }),
      supabase.from("reminders").select("*").eq("plant_id", params.id).order("due_date", { ascending: true }),
    ]);

  return NextResponse.json({
    plant,
    photos: photos || [],
    scans: scans || [],
    treatments: treatments || [],
    reminders: reminders || [],
  });
}

// PATCH /api/plants/[id] -> update profil
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const update: Record<string, unknown> = {};
  for (const f of PLANT_FIELDS) {
    if (f in body) update[f] = body[f];
  }
  if (Object.keys(update).length === 0)
    return NextResponse.json({ error: "Tidak ada perubahan." }, { status: 400 });

  const { error } = await supabase
    .from("plants")
    .update(update)
    .eq("id", params.id)
    .eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// DELETE /api/plants/[id]
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });

  const { error } = await supabase
    .from("plants")
    .delete()
    .eq("id", params.id)
    .eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
