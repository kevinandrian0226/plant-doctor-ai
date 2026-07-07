import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PLANT_FIELDS } from "@/lib/db-types";

export const runtime = "nodejs";

// GET /api/plants -> list tanaman milik user
export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });

  const { data, error } = await supabase
    .from("plants")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ plants: data });
}

// POST /api/plants -> buat profil tanaman
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const insert: Record<string, unknown> = { user_id: user.id };
  for (const f of PLANT_FIELDS) {
    if (f in body && body[f] !== "") insert[f] = body[f];
  }

  const { data, error } = await supabase
    .from("plants")
    .insert(insert)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ plant: data }, { status: 201 });
}
