import type { DiagnosisResult } from "./types";
import { HEALTH_META, RISK_META, ISSUE_TYPE_LABEL } from "./utils";

// Generate & download laporan diagnosa sebagai PDF (client-side, dynamic import jsPDF).
export async function downloadReportPdf(
  result: DiagnosisResult,
  meta: { plantName: string; date: string }
) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentW = pageW - margin * 2;
  let y = margin;

  const LEAF: [number, number, number] = [44, 112, 53];
  const GRAY: [number, number, number] = [110, 110, 110];
  const DARK: [number, number, number] = [30, 41, 28];

  function ensureSpace(h: number) {
    if (y + h > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  }

  function wrapped(text: string, x: number, maxW: number, size = 10, color = DARK): number {
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);
    const lines = doc.splitTextToSize(text || "-", maxW) as string[];
    lines.forEach((ln) => {
      ensureSpace(size + 4);
      doc.text(ln, x, y);
      y += size + 4;
    });
    return y;
  }

  function sectionTitle(t: string) {
    ensureSpace(28);
    y += 8;
    doc.setFillColor(241, 248, 242);
    doc.rect(margin, y - 11, contentW, 18, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(LEAF[0], LEAF[1], LEAF[2]);
    doc.text(t, margin + 6, y + 2);
    doc.setFont("helvetica", "normal");
    y += 18;
  }

  // Header
  doc.setFillColor(LEAF[0], LEAF[1], LEAF[2]);
  doc.rect(0, 0, pageW, 70, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Plant Doctor AI", margin, 34);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Laporan Diagnosa Tanaman", margin, 52);
  doc.setFontSize(9);
  doc.text(meta.date, pageW - margin, 52, { align: "right" });
  y = 92;

  // Identitas
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(DARK[0], DARK[1], DARK[2]);
  ensureSpace(20);
  doc.text(result.species_name, margin, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  if (result.scientific_name) {
    doc.setFontSize(10);
    doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
    doc.text(`${result.scientific_name}  -  ${result.category}`, margin, y);
    y += 14;
  }

  ensureSpace(20);
  doc.setFontSize(10);
  doc.setTextColor(DARK[0], DARK[1], DARK[2]);
  const statusLabel = HEALTH_META[result.health_status]?.label || result.health_status;
  const riskLabel = RISK_META[result.risk_level]?.label || result.risk_level;
  doc.text(
    `Skor: ${result.health_score}/100   |   Status: ${statusLabel}   |   ${riskLabel}   |   Keyakinan ID: ${Math.round(
      result.identify_confidence * 100
    )}%`,
    margin,
    y
  );
  y += 6;
  if (result.identify_note) {
    y += 6;
    wrapped(`Catatan identifikasi: ${result.identify_note}`, margin, contentW, 9, GRAY);
  }

  sectionTitle("Ringkasan");
  wrapped(result.summary, margin, contentW, 10);

  const flags: string[] = [];
  if (result.needs_isolation) flags.push("Perlu isolasi");
  if (result.needs_pruning) flags.push("Perlu potong daun");
  if (result.needs_root_check) flags.push("Perlu cek akar");
  if (result.consult_expert) flags.push("Disarankan konsultasi ahli/nursery");
  if (flags.length) {
    sectionTitle("Perhatian");
    wrapped("- " + flags.join("\n- "), margin, contentW, 10);
  }

  if (result.warning) {
    sectionTitle("Peringatan");
    wrapped(result.warning, margin, contentW, 10);
  }

  if (result.symptoms && result.symptoms.length) {
    sectionTitle("Gejala Terlihat");
    result.symptoms.forEach((s) => {
      doc.setFont("helvetica", "bold");
      wrapped(`${s.symptom} (${s.area} - ${s.severity})`, margin, contentW, 10);
      doc.setFont("helvetica", "normal");
      if (s.description) wrapped(s.description, margin + 10, contentW - 10, 9, GRAY);
    });
  }

  if (result.issues.length) {
    sectionTitle("Kemungkinan Penyebab");
    result.issues.forEach((it) => {
      doc.setFont("helvetica", "bold");
      wrapped(
        `${it.name} (${ISSUE_TYPE_LABEL[it.type] || it.type} - ${Math.round(it.confidence * 100)}%)`,
        margin,
        contentW,
        10
      );
      doc.setFont("helvetica", "normal");
      wrapped(it.description, margin + 10, contentW - 10, 9, GRAY);
    });
  }

  if (result.treatments.length) {
    sectionTitle("Rencana Perawatan");
    result.treatments
      .slice()
      .sort((a, b) => a.step - b.step)
      .forEach((t) => {
        doc.setFont("helvetica", "bold");
        wrapped(`${t.step}. ${t.title}  [${t.urgency}]`, margin, contentW, 10);
        doc.setFont("helvetica", "normal");
        wrapped(t.detail, margin + 12, contentW - 12, 9, GRAY);
      });
  }

  const env: [string, string][] = (
    [
      ["Media tanam", result.medium_fix],
      ["Penyiraman", result.watering_fix],
      ["Cahaya", result.light_fix],
      ["Sirkulasi udara", result.airflow_fix],
    ] as [string, string][]
  ).filter(([, v]) => v);
  if (env.length) {
    sectionTitle("Perbaikan Lingkungan");
    env.forEach(([k, v]) => {
      doc.setFont("helvetica", "bold");
      wrapped(`${k}:`, margin, contentW, 10);
      doc.setFont("helvetica", "normal");
      wrapped(v, margin + 12, contentW - 12, 9, GRAY);
    });
  }

  if (result.product_recommendation) {
    sectionTitle("Rekomendasi Produk (umum & aman)");
    wrapped(result.product_recommendation, margin, contentW, 10);
    wrapped("Selalu baca label & ikuti dosis anjuran. Uji pada area kecil dulu.", margin, contentW, 8, GRAY);
  }

  if (result.avoid && result.avoid.length) {
    sectionTitle("Hindari");
    wrapped("- " + result.avoid.join("\n- "), margin, contentW, 10);
  }

  if (result.followups.length) {
    sectionTitle("Jadwal Follow-up");
    result.followups
      .slice()
      .sort((a, b) => a.day - b.day)
      .forEach((f) => {
        doc.setFont("helvetica", "bold");
        wrapped(`Hari ke-${f.day}: ${f.action}`, margin, contentW, 10);
        doc.setFont("helvetica", "normal");
        if (f.focus) wrapped(`Pantau: ${f.focus}`, margin + 12, contentW - 12, 9, GRAY);
      });
  }

  if (result.care_tips.length) {
    sectionTitle("Tips Perawatan");
    wrapped("- " + result.care_tips.join("\n- "), margin, contentW, 10);
  }

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
    doc.text(
      "Dibuat oleh Plant Doctor AI - hasil bersifat estimasi, bukan pengganti penilaian ahli.",
      margin,
      pageH - 20
    );
    doc.text(`${i}/${pages}`, pageW - margin, pageH - 20, { align: "right" });
  }

  const safe = meta.plantName.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  doc.save(`laporan-${safe || "tanaman"}.pdf`);
}
