import type { DiagnosisResult, PhotoType } from "./types";
import type { DbPhotoType } from "./db-types";

// Map photo_type DB -> tipe yang dipahami AI vision
const PHOTO_TYPE_TO_AI: Record<DbPhotoType, PhotoType> = {
  whole_plant: "whole",
  leaf: "leaf",
  stem: "stem",
  root: "root",
  soil: "medium",
  other: "whole",
};
export function aiPhotoType(t: DbPhotoType): PhotoType {
  return PHOTO_TYPE_TO_AI[t] || "whole";
}

// Map tipe issue AI -> tipe issue skema ternormalisasi
const ISSUE_TYPE_MAP: Record<string, string> = {
  disease: "disease",
  pest: "pest",
  care: "care_issue",
  environment: "environment",
  deficiency: "nutrition",
  aging: "natural_aging",
  other: "unknown",
};

// Map severity kesehatan AI -> low | medium | high
const SEVERITY_MAP: Record<string, string> = {
  healthy: "low",
  mild: "low",
  serious: "medium",
  critical: "high",
};

// Payload diagnoses (per-issue) dari DiagnosisResult
export function diagnosisRows(result: DiagnosisResult, scanId: string, plantId: string | null) {
  return (result.issues || []).map((iss) => ({
    scan_id: scanId,
    plant_id: plantId,
    issue_name: iss.name,
    issue_type: ISSUE_TYPE_MAP[iss.type] || "unknown",
    confidence: iss.confidence, // 0..1
    severity: SEVERITY_MAP[iss.severity] || "low",
    description: iss.description,
  }));
}

// Payload treatments dari DiagnosisResult
export function treatmentRows(result: DiagnosisResult, plantId: string, scanId: string) {
  return (result.treatments || [])
    .slice()
    .sort((a, b) => a.step - b.step)
    .map((t) => ({
      plant_id: plantId,
      scan_id: scanId,
      title: t.title,
      instructions: t.detail || t.title,
      status: "pending" as const,
      due_date: null as string | null,
    }));
}

// Ringkasan untuk kolom scans
export function scanSummary(result: DiagnosisResult) {
  return {
    status: "completed" as const,
    health_score: result.health_score,
    risk_level: result.risk_level,
    summary: result.summary,
  };
}
