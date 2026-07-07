import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ReminderType } from "@/lib/db-types";

export const runtime = "nodejs";

const VALID_TYPES: ReminderType[] = ["watering", "fertilizer", "treatment", "follow_up_scan"];

// GET /api/reminders -> list reminder user (?done=, ?plant_id=)
export async function GET(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });

  const url = new URL(request.url);
  const done = url.searchParams.get("done");
  const plantId = url.searchParams.get("plant_id");

  let query = supabase
    .from("reminders")
    .select("*")
    .order("due_date", { ascending: true });
  if (done === "true") query = query.eq("is_done", true);
  if (done === "false") query = query.eq("is_done", false);
  if (plantId) query = query.eq("plant_id", plantId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ reminders: data });
}

// POST /api/reminders -> buat reminder
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const title = String(body.title || "").trim();
  const reminder_type = body.reminder_type as ReminderType;

  if (!title) return NextResponse.json({ error: "Judul reminder wajib." }, { status: 400 });
  if (!VALID_TYPES.includes(reminder_type))
    return NextResponse.json({ error: "reminder_type tidak valid." }, { status: 400 });

  const { data, error } = await supabase
    .from("reminders")
    .insert({
      user_id: user.id,
      plant_id: body.plant_id || null,
      title,
      reminder_type,
      due_date: body.due_date || null,
      repeat_rule: body.repeat_rule || null,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ reminder: data }, { status: 201 });
}
