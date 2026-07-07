import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

// GET /api/export — unduh seluruh data user (skema ternormalisasi) sebagai JSON
export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });

  const [plants, scans, diagnoses, treatments, reminders, photos] = await Promise.all([
    supabase.from("plants").select("*"),
    supabase.from("scans").select("*"),
    supabase.from("diagnoses").select("*"),
    supabase.from("treatments").select("*"),
    supabase.from("reminders").select("*"),
    supabase.from("plant_photos").select("*"),
  ]);

  const payload = {
    exported_at: new Date().toISOString(),
    user: { id: user.id, email: user.email },
    plants: plants.data || [],
    scans: scans.data || [],
    diagnoses: diagnoses.data || [],
    treatments: treatments.data || [],
    reminders: reminders.data || [],
    plant_photos: photos.data || [],
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="plant-doctor-export-${Date.now()}.json"`,
    },
  });
}
