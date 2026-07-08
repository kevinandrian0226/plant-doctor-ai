import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { chatWithDoctor, type ChatTurn } from "@/lib/anthropic";
import type { DiagnosisResult } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * POST /api/plants/[id]/chat -> "Tanya Dokter" chat lanjutan
 * Body: { messages: { role: "user"|"assistant"; content: string }[] }
 * Membangun konteks dari data tanaman + diagnosa terakhir, lalu memanggil AI.
 * -> { reply }
 */
export async function POST(
  request: Request,
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
    .eq("user_id", user.id)
    .single();
  if (!plant) return NextResponse.json({ error: "Tanaman tidak ditemukan." }, { status: 404 });

  const body = await request.json().catch(() => null);
  const rawMessages = body?.messages;
  if (!Array.isArray(rawMessages) || rawMessages.length === 0)
    return NextResponse.json({ error: "Pesan kosong." }, { status: 400 });

  const messages: ChatTurn[] = rawMessages
    .filter(
      (m: any) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim()
    )
    .map((m: any) => ({ role: m.role, content: String(m.content).slice(0, 2000) }));

  if (messages.length === 0)
    return NextResponse.json({ error: "Pesan tidak valid." }, { status: 400 });

  // Konteks diagnosa terakhir (opsional)
  const { data: lastScan } = await supabase
    .from("scans")
    .select("*")
    .eq("plant_id", params.id)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const result = (lastScan?.ai_result_json || {}) as Partial<DiagnosisResult>;
  const issues = Array.isArray(result.issues) ? result.issues.map((i) => i.name).filter(Boolean) : [];
  const treatmentSteps = Array.isArray(result.treatments)
    ? result.treatments.map((t) => t.title).filter(Boolean)
    : [];

  try {
    const reply = await chatWithDoctor(
      {
        plantName: plant.nickname || plant.common_name || "Tanaman",
        scientificName: plant.scientific_name || undefined,
        category: plant.category || undefined,
        summary: lastScan?.summary || result.summary || undefined,
        healthScore: lastScan?.health_score ?? result.health_score ?? undefined,
        issues,
        treatmentSteps,
      },
      messages
    );
    return NextResponse.json({ reply });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal menghubungi Dokter AI.";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
