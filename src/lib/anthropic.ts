import Anthropic from "@anthropic-ai/sdk";
import type {
  DiagnosisResult,
  RecoveryResult,
  PlantMode,
  PhotoType,
  ScanContext,
  HealthStatus,
  RiskLevel,
  IssueType,
  TreatmentStep,
} from "./types";
import { LIGHT_META, LOCATION_META } from "./utils";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5-20250929";

type SupportedMedia = "image/jpeg" | "image/png" | "image/webp" | "image/gif";

function normalizeMedia(mime: string): SupportedMedia {
  const m = mime.toLowerCase();
  if (m.includes("png")) return "image/png";
  if (m.includes("webp")) return "image/webp";
  if (m.includes("gif")) return "image/gif";
  return "image/jpeg";
}

export interface PhotoData {
  type: PhotoType;
  base64: string;
  mime: string;
}

const PHOTO_LABEL: Record<PhotoType, string> = {
  whole: "Foto seluruh tanaman",
  leaf: "Foto daun close-up",
  stem: "Foto batang/petiol",
  medium: "Foto media tanam",
  root: "Foto akar",
};

const ISSUE_CHECKLIST = `fungal leaf spot, bacterial leaf spot, root rot, stem rot, overwatering,
underwatering, sunburn, low humidity stress, nutrient deficiency, fertilizer burn, thrips,
spider mites, mealybug (kutu putih), scale insect, leaf yellowing, browning variegation,
normal old leaf aging`;

function contextText(ctx?: ScanContext): string {
  if (!ctx) return "";
  const lines: string[] = [];
  if (ctx.species_hint) lines.push(`- Dugaan jenis dari user: ${ctx.species_hint}`);
  if (ctx.location) lines.push(`- Lokasi: ${LOCATION_META[ctx.location]?.label || ctx.location}`);
  if (ctx.light_condition)
    lines.push(`- Kondisi cahaya: ${LIGHT_META[ctx.light_condition]?.label || ctx.light_condition}`);
  if (ctx.watering_interval_days) lines.push(`- Frekuensi siram: tiap ${ctx.watering_interval_days} hari`);
  if (ctx.growing_medium) lines.push(`- Media tanam: ${ctx.growing_medium}`);
  if (ctx.last_fertilized_at) lines.push(`- Terakhir dipupuk: ${ctx.last_fertilized_at}`);
  if (lines.length === 0) return "";
  return `\n\nKONTEKS PERAWATAN DARI USER (gunakan untuk mempertajam diagnosa):\n${lines.join("\n")}`;
}

function buildSystemPrompt(mode: PlantMode): string {
  const specialIntro =
    mode === "aroid"
      ? `\nMODE AKTIF: AROID. Isi "special_notes.aroid_variegation_score" (0-100) dan beri perhatian pada kesehatan variegata, risiko browning area putih, kebutuhan cahaya, serta risiko overwatering monstera/philodendron/anthurium.`
      : mode === "bonsai"
      ? `\nMODE AKTIF: BONSAI. Isi "special_notes.bonsai_specific_notes" (teks) tentang daun menguning, kekeringan, jamur batang/media, akar terlalu basah, kutu, saran pruning ringan, dan posisi cahaya.`
      : `\nMODE AKTIF: UMUM.`;

  return `Kamu adalah AI Plant Health Assistant. Analisa gambar tanaman yang diberikan user.
${specialIntro}

Kamu menerima SATU ATAU BEBERAPA foto dari satu tanaman yang sama (seluruh tanaman, daun, batang, media tanam, akar). Gabungkan semua foto.

TUGAS:
1. Identifikasi jenis tanaman dari foto.
2. Jika tidak yakin, berikan beberapa kemungkinan terdekat (alternative_possibilities).
3. Analisa kondisi kesehatan berdasarkan daun, batang, akar, media tanam, warna, bercak, tekstur, dan pola kerusakan.
4. Bedakan antara penyakit, hama, masalah perawatan, kekurangan nutrisi, sunburn, overwatering, underwatering, dan penuaan daun normal.
5. JANGAN memberi diagnosis absolut. Gunakan istilah "kemungkinan", "indikasi", atau "perlu dicek".
6. Berikan confidence score (0-100).
7. Berikan langkah treatment yang AMAN, bertahap, dan mudah dilakukan.
8. Jika foto tidak jelas atau kurang lengkap, set overall_status "uncertain", turunkan confidence, dan di "health_status.summary" serta "special_notes.warning" MINTA user mengunggah foto tambahan (mis. daun close-up, batang, akar, atau media tanam). Tetap isi data sebaik mungkin dari yang terlihat.
9. Untuk aroid variegated (Monstera Albo, Thai Constellation, Philodendron variegata), beri catatan khusus tentang risiko browning, cahaya, kelembapan, dan overwatering.
10. Untuk bonsai, beri catatan khusus tentang media, akar, pruning, jamur, dan penyiraman.

Pertimbangkan kemungkinan masalah (tidak terbatas pada ini): ${ISSUE_CHECKLIST}. Bedakan penuaan daun tua yang NORMAL dari penyakit.

ATURAN KEAMANAN (WAJIB — utamakan keselamatan tanaman & pengguna):
1. JANGAN pernah menyatakan diagnosis 100% pasti. Selalu pakai "kemungkinan", "indikasi", atau "perlu dicek". Confidence tidak boleh 100.
2. WAJIB selalu mengisi "disclaimer".
3. Jika confidence rendah (< 60) atau foto kurang jelas, set overall_status "uncertain" dan MINTA foto tambahan (daun close-up, batang, akar, media) di "summary" dan "special_notes.warning".
4. JANGAN menyebut dosis bahan kimia berbahaya secara spesifik. Untuk pestisida/fungisida/insektisida, cukup arahkan "gunakan sesuai petunjuk label produk".
5. Prioritaskan rekomendasi UMUM & AMAN di immediate_actions/care_adjustments: isolasi tanaman, potong bagian yang rusak, sterilkan alat, perbaiki sirkulasi udara (airflow), atur/kurangi penyiraman, cek akar, ganti media bila busuk, gunakan fungisida/insektisida sesuai label.
6. Isi "special_notes.warning" dan sarankan konsultasi nursery/ahli bila ada: busuk akar parah, batang lembek/mushy, penyebaran cepat, serangan hama berat, ATAU tanaman mahal/rare.

ATURAN OUTPUT (WAJIB):
- Output WAJIB berupa JSON valid sesuai schema di bawah. JANGAN menambahkan teks apa pun di luar JSON (tanpa markdown, tanpa code fence).
- Semua teks untuk manusia dalam Bahasa Indonesia: ramah, jelas, actionable, dan TIDAK absolut (pakai "kemungkinan/indikasi/perlu dicek").
- Semua "confidence" dan "health_score" berupa angka 0-100.
- Rekomendasi produk harus AMAN & umum. Jangan menyarankan bahan berbahaya/ilegal.
- Jika gambar JELAS BUKAN tanaman, set overall_status "uncertain", confidence 0, kosongkan detected_symptoms & possible_causes, dan jelaskan di summary.
- "follow_up_schedule" WAJIB berisi hari ke-3, 7, dan 14.

SKEMA JSON (gunakan PERSIS struktur & enum ini):
{
  "plant_identification": {
    "common_name": "",
    "scientific_name": "",
    "category": "",
    "confidence": 0,
    "alternative_possibilities": [ { "name": "", "confidence": 0 } ]
  },
  "health_status": {
    "overall_status": "healthy | mild_issue | moderate_issue | severe_issue | uncertain",
    "health_score": 0,
    "risk_level": "low | medium | high | emergency",
    "summary": ""
  },
  "detected_symptoms": [
    { "symptom": "", "visible_area": "leaf | stem | root | soil | whole_plant", "severity": "low | medium | high", "description": "" }
  ],
  "possible_causes": [
    { "cause": "", "type": "disease | pest | care_issue | environment | nutrition | natural_aging | unknown", "confidence": 0, "reasoning": "" }
  ],
  "treatment_plan": {
    "immediate_actions": [],
    "care_adjustments": [],
    "recommended_products_general": [],
    "what_to_avoid": [],
    "follow_up_schedule": [ { "day": 3, "task": "" }, { "day": 7, "task": "" }, { "day": 14, "task": "" } ]
  },
  "special_notes": {
    "aroid_variegation_score": ${mode === "aroid" ? "0" : "null"},
    "bonsai_specific_notes": ${mode === "bonsai" ? '""' : "null"},
    "warning": ""
  },
  "disclaimer": "Diagnosis ini adalah estimasi berbasis foto, bukan pengganti pemeriksaan langsung oleh ahli tanaman."
}`;
}

function buildContent(photos: PhotoData[], ctx?: ScanContext) {
  const content: Anthropic.MessageParam["content"] = [];
  photos.forEach((p) => {
    content.push({ type: "text", text: `[${PHOTO_LABEL[p.type]}]` });
    content.push({
      type: "image",
      source: { type: "base64", media_type: normalizeMedia(p.mime), data: p.base64 },
    });
  });
  content.push({
    type: "text",
    text: `Analisa tanaman pada foto-foto di atas dan hasilkan JSON sesuai skema.${contextText(ctx)}
Balas HANYA JSON.`,
  });
  return content;
}

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY belum di-set di environment.");
  return new Anthropic({ apiKey });
}

function extractJson(raw: string): any {
  let t = raw.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) t = fence[1].trim();
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start !== -1 && end !== -1) t = t.slice(start, end + 1);
  return JSON.parse(t);
}

function clamp(n: unknown, min: number, max: number, def: number): number {
  const v = typeof n === "number" ? n : Number(n);
  if (Number.isNaN(v)) return def;
  return Math.min(max, Math.max(min, v));
}

// Confidence/score datang 0-100; normalkan ke 0..1
// Confidence 0..1, DIBATASI maksimal 0.99 (safety: jangan pernah 100% pasti)
function pct01(n: unknown): number {
  const v = clamp(n, 0, 100, 0);
  return Math.min(0.99, Math.round(v) / 100);
}

// Deteksi kondisi serius dari teks untuk safety warning + saran konsultasi ahli
function detectSevere(corpus: string): boolean {
  const t = corpus.toLowerCase();
  const rootRotSevere = /(busuk akar|root rot)/.test(t) && /(parah|berat|severe|lanjut)/.test(t);
  return (
    rootRotSevere ||
    /batang lembek|batang lunak|mushy stem|soft stem|stem rot|busuk batang/.test(t) ||
    /penyebaran cepat|menyebar cepat|cepat menyebar|rapid spread|spreading fast/.test(t) ||
    /hama berat|serangan berat|infestasi berat|heavy infestation|severe infestation/.test(t)
  );
}

const STATUS_MAP: Record<string, HealthStatus> = {
  healthy: "healthy",
  mild_issue: "mild",
  moderate_issue: "serious",
  severe_issue: "critical",
  uncertain: "mild",
};

const CAUSE_TYPE_MAP: Record<string, IssueType> = {
  disease: "disease",
  pest: "pest",
  care_issue: "care",
  environment: "environment",
  nutrition: "deficiency",
  natural_aging: "aging",
  unknown: "other",
};

function matchAny(texts: string[], re: RegExp): boolean {
  return texts.some((t) => re.test(t));
}

// Map JSON skema baru -> DiagnosisResult internal (dipakai UI & DB)
// Safety filter: netralkan dosis kimia spesifik, arahkan ke petunjuk label.
function sanitizeProductText(text: string): string {
  if (!text) return text;
  let t = text;
  // angka + satuan dosis (mis. "5 ml/liter", "2 gram per air", "0.5%")
  t = t.replace(
    /\b\d+(?:[.,]\d+)?\s?(?:ml|cc|l|liter|liters|g|gr|gram|grams|kg|sdm|sdt|sendok(?:\steh|\smakan)?|tutup(?:\sbotol)?|%)\b(?:\s?(?:\/|per)\s?\d*\s?(?:l|liter|air|m2|tanaman)?)?/gi,
    "(dosis sesuai label)"
  );
  // rasio seperti 1:1000
  t = t.replace(/\b\d+\s?:\s?\d+\b/g, "(rasio sesuai label)");
  if (!/label/i.test(t)) {
    t = t.trim().replace(/[.\s]*$/, "") + ". Gunakan sesuai petunjuk label produk.";
  }
  return t.trim();
}

function mapAiToResult(ai: any, mode: PlantMode): DiagnosisResult {
  const pid = ai.plant_identification || {};
  const hs = ai.health_status || {};
  const tp = ai.treatment_plan || {};
  const sn = ai.special_notes || {};

  const validRisk = ["low", "medium", "high", "emergency"];
  const risk_level = (validRisk.includes(hs.risk_level) ? hs.risk_level : "low") as RiskLevel;
  const health_status = STATUS_MAP[hs.overall_status as string] || "mild";

  const symptoms = Array.isArray(ai.detected_symptoms)
    ? ai.detected_symptoms.map((s: any) => ({
        symptom: s.symptom || "",
        area: s.visible_area || "whole_plant",
        severity: ["low", "medium", "high"].includes(s.severity) ? s.severity : "low",
        description: s.description || "",
      }))
    : [];

  const issues = Array.isArray(ai.possible_causes)
    ? ai.possible_causes.map((c: any) => ({
        name: c.cause || "",
        type: CAUSE_TYPE_MAP[c.type as string] || "other",
        severity: health_status,
        confidence: pct01(c.confidence),
        description: c.reasoning || "",
      }))
    : [];

  const treatments: TreatmentStep[] = [];
  let step = 1;
  (Array.isArray(tp.immediate_actions) ? tp.immediate_actions : []).forEach((a: string) => {
    if (a && a.trim()) treatments.push({ step: step++, title: a.trim(), detail: "", urgency: "high" });
  });
  (Array.isArray(tp.care_adjustments) ? tp.care_adjustments : []).forEach((a: string) => {
    if (a && a.trim()) treatments.push({ step: step++, title: a.trim(), detail: "", urgency: "medium" });
  });

  const followups = Array.isArray(tp.follow_up_schedule)
    ? tp.follow_up_schedule.map((f: any) => ({
        day: Number(f.day) || 0,
        action: f.task || "",
        focus: "",
      }))
    : [];

  const avoid = Array.isArray(tp.what_to_avoid) ? tp.what_to_avoid.filter(Boolean) : [];
  const products = Array.isArray(tp.recommended_products_general)
    ? tp.recommended_products_general.filter(Boolean)
    : [];

  const alternatives = Array.isArray(pid.alternative_possibilities)
    ? pid.alternative_possibilities
        .filter((a: any) => a && a.name)
        .map((a: any) => ({ name: a.name, confidence: pct01(a.confidence) }))
    : [];

  // Derivasi flag tindakan dari teks
  const corpus = [
    ...treatments.map((t) => t.title),
    ...avoid,
    ...issues.map((i: any) => `${i.name} ${i.description}`),
  ].map((s) => s.toLowerCase());
  const needs_isolation = matchAny(corpus, /isolasi|pisahkan|karantina|quarantine/);
  const needs_pruning = matchAny(corpus, /pangkas|potong daun|prune|pruning|buang daun/);
  const needs_root_check = matchAny(corpus, /\bakar\b|root rot|cek akar|periksa akar/);

  // ---- Safety layer (defense-in-depth) ----
  const identifyConf = pct01(pid.confidence);
  const lowConfidence = identifyConf < 0.6;
  const severeCorpus = [
    hs.summary || "",
    ...issues.map((i: any) => `${i.name} ${i.description}`),
    ...symptoms.map((s: any) => `${s.symptom} ${s.description}`),
  ].join(" ");
  const severe = detectSevere(severeCorpus);

  let warning = sn.warning || "";
  // (rule 3) confidence rendah -> minta foto tambahan
  if (lowConfidence && !warning) {
    warning =
      "Tingkat keyakinan rendah. Unggah foto tambahan (daun close-up, batang, akar, dan media tanam) untuk diagnosa yang lebih akurat.";
  }
  // (rule 6) kondisi serius -> warning konsultasi ahli
  if (severe && !warning) {
    warning =
      "Indikasi kondisi serius (mis. busuk akar parah, batang lembek, penyebaran cepat, atau hama berat). Sebaiknya konsultasikan ke nursery atau ahli tanaman.";
  }

  const uncertain = hs.overall_status === "uncertain" || lowConfidence;
  const consult_expert =
    severe ||
    risk_level === "high" ||
    risk_level === "emergency" ||
    /ahli|nursery|dokter tanaman|profesional/i.test(warning);

  // Bukan tanaman hanya jika benar-benar tak ada sinyal tanaman.
  // Foto tanaman yang buram tetap dianggap tanaman (lalu minta foto tambahan via warning).
  const hasPlantSignal =
    !!pid.common_name ||
    (pid.category && pid.category !== "lainnya") ||
    symptoms.length > 0 ||
    issues.length > 0;
  const isPlant = hasPlantSignal || hs.overall_status !== "uncertain";

  const result: DiagnosisResult = {
    is_plant: isPlant,
    species_name: pid.common_name || "Tidak teridentifikasi",
    scientific_name: pid.scientific_name || "",
    category: pid.category || "lainnya",
    identify_confidence: identifyConf,
    identify_note: uncertain ? "Identifikasi/kondisi belum pasti dari foto." : "",
    health_status,
    health_score: Math.round(clamp(hs.health_score, 0, 100, 60)),
    summary: hs.summary || "Tidak ada ringkasan.",
    risk_level,
    issues,
    treatments,
    needs_isolation,
    needs_pruning,
    needs_root_check,
    consult_expert,
    medium_fix: "",
    watering_fix: "",
    light_fix: "",
    airflow_fix: "",
    product_recommendation: sanitizeProductText(products.join("; ")),
    followups,
    care_tips: [],
    uncertain,
    alternatives,
    symptoms,
    avoid,
    warning,
    disclaimer:
      ai.disclaimer ||
      "Diagnosis ini adalah estimasi berbasis foto, bukan pengganti pemeriksaan langsung oleh ahli tanaman.",
    special_mode: mode === "general" ? null : mode,
  };

  if (mode === "aroid" && sn.aroid_variegation_score != null) {
    result.aroid = {
      variegation_health_score: Math.round(clamp(sn.aroid_variegation_score, 0, 100, 60)),
      white_area_ratio: 0,
      browning_risk: risk_level,
      too_much_white: false,
      light_recommendation: "",
      overwatering_warning: warning,
      notes: "",
    };
  }
  if (mode === "bonsai" && sn.bonsai_specific_notes) {
    result.bonsai = {
      leaf_yellowing: false,
      dryness: false,
      trunk_or_soil_fungus: false,
      roots_too_wet: false,
      pest_presence: false,
      pruning_advice: "",
      light_position_advice: "",
      notes: String(sn.bonsai_specific_notes),
    };
  }

  return result;
}

/**
 * Diagnosa tanaman dari beberapa foto + mode + konteks opsional.
 * AI menghasilkan JSON skema lengkap; di-map ke DiagnosisResult internal.
 */
export async function diagnosePlant(
  photos: PhotoData[],
  mode: PlantMode = "general",
  ctx?: ScanContext
): Promise<DiagnosisResult> {
  const anthropic = getClient();
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 3000,
    system: buildSystemPrompt(mode),
    messages: [{ role: "user", content: buildContent(photos, ctx) }],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  const raw = textBlock && textBlock.type === "text" ? textBlock.text : "";

  let parsed: any;
  try {
    parsed = extractJson(raw);
  } catch {
    throw new Error("Gagal membaca hasil AI (format JSON tidak valid).");
  }

  return mapAiToResult(parsed, mode);
}

/**
 * Bandingkan kondisi tanaman sekarang vs diagnosa sebelumnya (recovery tracker).
 */
export async function compareRecovery(
  currentPhotos: PhotoData[],
  previous: { summary: string; health_score: number; issues: string[] }
): Promise<RecoveryResult> {
  const anthropic = getClient();
  const system = `Kamu adalah "Plant Doctor AI". Bandingkan kondisi tanaman SEKARANG (foto) dengan SEBELUMNYA (deskripsi).
Balas HANYA JSON valid:
{
  "trend": "improving"|"stable"|"worsening"|"needs_action",
  "health_score": number,
  "summary": string,
  "changes": [string],
  "next_actions": [string]
}`;

  const content: Anthropic.MessageParam["content"] = [
    {
      type: "text",
      text: `KONDISI SEBELUMNYA:\n- Ringkasan: ${previous.summary}\n- Skor: ${previous.health_score}/100\n- Masalah: ${previous.issues.join(", ") || "tidak ada"}\n\nFOTO SEKARANG:`,
    },
  ];
  currentPhotos.forEach((p) => {
    content.push({
      type: "image",
      source: { type: "base64", media_type: normalizeMedia(p.mime), data: p.base64 },
    });
  });
  content.push({ type: "text", text: "Bandingkan dan balas HANYA JSON sesuai skema." });

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1200,
    system,
    messages: [{ role: "user", content }],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  const raw = textBlock && textBlock.type === "text" ? textBlock.text : "";
  let parsed: any;
  try {
    parsed = extractJson(raw);
  } catch {
    throw new Error("Gagal membaca hasil perbandingan AI.");
  }

  const validTrend = ["improving", "stable", "worsening", "needs_action"];
  return {
    trend: validTrend.includes(parsed.trend) ? parsed.trend : "stable",
    health_score: Math.round(clamp(parsed.health_score, 0, 100, 60)),
    summary: parsed.summary || "",
    changes: Array.isArray(parsed.changes) ? parsed.changes : [],
    next_actions: Array.isArray(parsed.next_actions) ? parsed.next_actions : [],
  };
}

/**
 * "Tanya Dokter" — chat lanjutan grounded pada diagnosa tanaman.
 * Menjawab pertanyaan perawatan user dengan konteks diagnosa terakhir.
 */
export interface ChatContext {
  plantName: string;
  scientificName?: string;
  category?: string;
  summary?: string;
  healthScore?: number;
  issues?: string[];
  treatmentSteps?: string[];
}
export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export async function chatWithDoctor(
  ctx: ChatContext,
  history: ChatTurn[]
): Promise<string> {
  const anthropic = getClient();

  const ctxLines = [
    `- Tanaman: ${ctx.plantName}${ctx.scientificName ? ` (${ctx.scientificName})` : ""}`,
    ctx.category ? `- Kategori: ${ctx.category}` : "",
    ctx.healthScore != null ? `- Skor kesehatan terakhir: ${ctx.healthScore}/100` : "",
    ctx.summary ? `- Ringkasan diagnosa: ${ctx.summary}` : "",
    ctx.issues && ctx.issues.length ? `- Masalah terdeteksi: ${ctx.issues.join(", ")}` : "",
    ctx.treatmentSteps && ctx.treatmentSteps.length
      ? `- Rencana perawatan: ${ctx.treatmentSteps.slice(0, 6).join("; ")}`
      : "",
  ].filter(Boolean).join("\n");

  const system = `Kamu adalah "Plant Doctor AI", asisten dokter tanaman yang ramah untuk penghobi tanaman hias premium (aroid, monstera, anthurium, aglaonema, bonsai, sukulen).
Jawab pertanyaan lanjutan user dalam Bahasa Indonesia yang hangat, ringkas, dan praktis (maksimal ~4 kalimat atau poin singkat bila perlu).
Selalu berlandaskan KONTEKS DIAGNOSA di bawah. Jika pertanyaan di luar konteks tanaman/perawatan, arahkan kembali dengan sopan.

Aturan keamanan (WAJIB):
- JANGAN sebut dosis kimia spesifik (mili, gram, rasio); arahkan "ikuti petunjuk label produk".
- Untuk kondisi serius (busuk akar/batang parah, penyebaran cepat, hama berat), sarankan konsultasi ke nursery/ahli tanaman.
- Ingatkan bahwa jawaban adalah estimasi berbasis foto, bukan pengganti pemeriksaan langsung, HANYA bila relevan (jangan tiap pesan).
- Jangan mengarang fakta; jika tidak yakin, katakan perlu foto/informasi tambahan.

KONTEKS DIAGNOSA:
${ctxLines || "- (belum ada diagnosa; minta user melakukan scan terlebih dahulu bila perlu)"}`;

  const messages: Anthropic.MessageParam[] = history
    .filter((m) => m.content && m.content.trim())
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content }));

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    throw new Error("Pesan terakhir harus dari user.");
  }

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 700,
    system,
    messages,
  });

  const textBlock = message.content.find((b) => b.type === "text");
  const raw = textBlock && textBlock.type === "text" ? textBlock.text : "";
  return sanitizeProductText(raw.trim()) || "Maaf, aku belum bisa menjawab itu. Coba tanyakan hal lain seputar perawatan tanamanmu.";
}

/** Care guide otomatis per spesies (ala PictureThis). */
export interface CareGuide {
  light: string;
  water: string;
  humidity: string;
  temperature: string;
  soil: string;
  fertilizer: string;
  repotting: string;
  tips: string[];
  toxicity: string;
}

export async function generateCareGuide(plant: {
  name: string;
  scientificName?: string;
  category?: string;
}): Promise<CareGuide> {
  const anthropic = getClient();
  const system = `Kamu "Plant Doctor AI". Buat panduan perawatan ringkas & praktis (Bahasa Indonesia) untuk tanaman berikut. Balas HANYA JSON valid:
{"light":string,"water":string,"humidity":string,"temperature":string,"soil":string,"fertilizer":string,"repotting":string,"tips":[string],"toxicity":string}
Aturan: jangan sebut dosis kimia spesifik (arahkan ikuti petunjuk label). Setiap field 1-2 kalimat singkat. tips maksimal 4.`;
  const msg = `Tanaman: ${plant.name}${plant.scientificName ? ` (${plant.scientificName})` : ""}${plant.category ? `, kategori ${plant.category}` : ""}. Balas HANYA JSON.`;
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 900,
    system,
    messages: [{ role: "user", content: msg }],
  });
  const textBlock = message.content.find((b) => b.type === "text");
  const raw = textBlock && textBlock.type === "text" ? textBlock.text : "";
  let p: any;
  try {
    p = extractJson(raw);
  } catch {
    throw new Error("Gagal membuat panduan perawatan.");
  }
  const str = (v: any) => (typeof v === "string" ? v.trim() : "");
  return {
    light: str(p.light),
    water: str(p.water),
    humidity: str(p.humidity),
    temperature: str(p.temperature),
    soil: str(p.soil),
    fertilizer: sanitizeProductText(str(p.fertilizer)),
    repotting: str(p.repotting),
    tips: Array.isArray(p.tips) ? p.tips.slice(0, 4).map((t: any) => str(t)).filter(Boolean) : [],
    toxicity: str(p.toxicity),
  };
}
