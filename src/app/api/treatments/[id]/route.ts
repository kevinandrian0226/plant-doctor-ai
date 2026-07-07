import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
const VALID = ["pending", "in_progress", "completed"];

// PATCH /api/treatments/[id] -> update status (pending|in_progress|completed)
// Saat status -> in_progress, otomatis buat reminder follow-up treatment (3 hari).
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const status = body.status as string;
  if (!VALID.includes(status)) return NextResponse.json({ error: "status tidak valid." }, { status: 400 });

  const { data, error } = await supabase
    .from("treatments")
    .update({ status, completed_at: status === "completed" ? new Date().toISOString() : null })
    .eq("id", params.id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Treatment tidak ditemukan." }, { status: 404 });

  let reminder = null;
  if (status === "in_progress" && data.plant_id) {
    const title = `Cek progress: ${data.title}`;
    const { data: existing } = await supabase
      .from("reminders").select("id").eq("plant_id", data.plant_id).eq("title", title).eq("is_done", false).limit(1);
    if (!existing || existing.length === 0) {
      const due = new Date(); due.setDate(due.getDate() + 3);
      const { data: r } = await supabase
        .from("reminders")
        .insert({ user_id: user.id, plant_id: data.plant_id, title, reminder_type: "treatment", due_date: due.toISOString().slice(0, 10) })
        .select("*").single();
      reminder = r;
    }
  }

  return NextResponse.json({ treatment: data, reminder });
}
