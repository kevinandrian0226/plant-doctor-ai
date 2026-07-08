import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const CARE_RULES = ["every 3 days", "every 14 days", "every 7 days"];

function d(days: number) {
  const dt = new Date();
  dt.setDate(dt.getDate() + days);
  return dt.toISOString().slice(0, 10);
}

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });

  const { data: plant } = await supabase
    .from("plants").select("id, nickname, common_name").eq("id", params.id).eq("user_id", user.id).maybeSingle();
  if (!plant) return NextResponse.json({ error: "Tanaman tidak ditemukan." }, { status: 404 });
  const name = plant.nickname || plant.common_name || "tanaman";

  // Idempotent: hapus jadwal perawatan lama yang di-generate untuk tanaman ini
  // sebelum menyisipkan yang baru, agar tidak menumpuk reminder ganda.
  await supabase
    .from("reminders").delete()
    .eq("plant_id", params.id).eq("user_id", user.id).in("repeat_rule", CARE_RULES);

  const rows = [
    { user_id: user.id, plant_id: params.id, title: `Siram ${name}`, reminder_type: "watering", due_date: d(3), repeat_rule: "every 3 days" },
    { user_id: user.id, plant_id: params.id, title: `Pupuk ${name}`, reminder_type: "fertilizer", due_date: d(14), repeat_rule: "every 14 days" },
    { user_id: user.id, plant_id: params.id, title: `Cek kesehatan ${name}`, reminder_type: "follow_up_scan", due_date: d(7), repeat_rule: "every 7 days" },
  ];
  const { error } = await supabase.from("reminders").insert(rows);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ created: rows.length });
}
