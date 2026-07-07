import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * PATCH /api/reminders/[id] -> update status selesai/belum (atau jadwal)
 * Body: { is_done?, due_date?, title?, repeat_rule? }
 */
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
  if ("is_done" in body) update.is_done = !!body.is_done;
  if ("due_date" in body) update.due_date = body.due_date || null;
  if ("title" in body) update.title = String(body.title || "").trim();
  if ("repeat_rule" in body) update.repeat_rule = body.repeat_rule || null;

  if (Object.keys(update).length === 0)
    return NextResponse.json({ error: "Tidak ada perubahan." }, { status: 400 });

  const { data, error } = await supabase
    .from("reminders")
    .update(update)
    .eq("id", params.id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Reminder tidak ditemukan." }, { status: 404 });
  return NextResponse.json({ reminder: data });
}

// DELETE /api/reminders/[id]
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
    .from("reminders")
    .delete()
    .eq("id", params.id)
    .eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
