// Tipe data bersama untuk Plant Doctor AI

export type HealthStatus = "healthy" | "mild" | "serious" | "critical";
export type RiskLevel = "low" | "medium" | "high" | "emergency";
export type IssueType =
  | "disease"
  | "pest"
  | "deficiency"
  | "care"
  | "environment"
  | "aging"
  | "other";
export type Urgency = "low" | "medium" | "high";
export type PlantMode = "general" | "aroid" | "bonsai";
export type RecoveryTrend = "improving" | "stable" | "worsening" | "needs_action";

// Jenis foto yang bisa diunggah
export type PhotoType = "whole" | "leaf" | "stem" | "medium" | "root";

export interface PhotoInput {
  type: PhotoType;
  url: string;
}

export interface PlantIssue {
  name: string;
  type: IssueType;
  severity: HealthStatus;
  confidence: number; // 0..1
  description: string;
}

export interface TreatmentStep {
  step: number;
  title: string;
  detail: string;
  urgency: Urgency;
}

export interface FollowUp {
  day: number; // 3 | 7 | 14
  action: string;
  focus: string; // apa yang dipantau
}

export interface AltPossibility {
  name: string;
  confidence: number; // 0..1
}

export type VisibleArea = "leaf" | "stem" | "root" | "soil" | "whole_plant";

export interface DetectedSymptom {
  symptom: string;
  area: VisibleArea | string;
  severity: "low" | "medium" | "high";
  description: string;
}

// Analisa khusus mode aroid
export interface AroidAnalysis {
  variegation_health_score: number; // 0..100
  white_area_ratio: number; // 0..1 perkiraan proporsi area putih
  browning_risk: RiskLevel;
  too_much_white: boolean;
  light_recommendation: string;
  overwatering_warning: string;
  notes: string;
}

// Analisa khusus mode bonsai
export interface BonsaiAnalysis {
  leaf_yellowing: boolean;
  dryness: boolean;
  trunk_or_soil_fungus: boolean;
  roots_too_wet: boolean;
  pest_presence: boolean;
  pruning_advice: string;
  light_position_advice: string;
  notes: string;
}

// Bentuk JSON terstruktur yang dihasilkan AI Vision
export interface DiagnosisResult {
  is_plant: boolean;
  species_name: string;
  scientific_name: string;
  category: string;
  identify_confidence: number; // 0..1
  identify_note: string; // catatan jika tidak yakin

  health_status: HealthStatus;
  health_score: number; // 0..100
  summary: string;

  risk_level: RiskLevel;
  issues: PlantIssue[];
  treatments: TreatmentStep[];

  // tindakan kritikal
  needs_isolation: boolean;
  needs_pruning: boolean;
  needs_root_check: boolean;
  consult_expert: boolean;

  // perbaikan lingkungan/perawatan
  medium_fix: string;
  watering_fix: string;
  light_fix: string;
  airflow_fix: string;
  product_recommendation: string; // fungisida/insektisida aman (umum)

  followups: FollowUp[];
  care_tips: string[];

  // dari skema AI baru
  uncertain: boolean; // overall_status === "uncertain" (foto kurang jelas)
  alternatives: AltPossibility[];
  symptoms: DetectedSymptom[];
  avoid: string[]; // what_to_avoid
  warning: string;
  disclaimer: string;

  // mode khusus (opsional)
  special_mode: PlantMode | null;
  aroid?: AroidAnalysis;
  bonsai?: BonsaiAnalysis;
}

// Hasil perbandingan recovery
export interface RecoveryResult {
  trend: RecoveryTrend;
  health_score: number; // 0..100 kondisi sekarang
  summary: string;
  changes: string[]; // perubahan yang terlihat
  next_actions: string[];
}

// ---------- Baris database ----------
export interface PlantRow {
  id: string;
  user_id: string;
  nickname: string | null;
  species_name: string | null;
  scientific_name: string | null;
  category: string | null;
  cover_photo_url: string | null;
  current_status: string;
  // profil
  acquired_date: string | null;
  location: string | null;
  growing_medium: string | null;
  watering_interval_days: number | null;
  fertilizing_interval_days: number | null;
  last_watered_at: string | null;
  last_fertilized_at: string | null;
  light_condition: string | null;
  plant_mode: PlantMode;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Data opsional yang diisi user di form scan (membantu akurasi AI)
export type LightCondition = "low" | "medium" | "bright" | "direct";
export type LocationType = "indoor" | "outdoor";

export interface ScanContext {
  species_hint?: string;
  location?: LocationType | "";
  watering_interval_days?: number | null;
  growing_medium?: string;
  last_fertilized_at?: string; // ISO date
  light_condition?: LightCondition | "";
}

export interface DiagnosisRow {
  id: string;
  plant_id: string;
  user_id: string;
  photo_url: string;
  photos: PhotoInput[];
  species_name: string | null;
  scientific_name: string | null;
  category: string | null;
  identify_confidence: number | null;
  health_status: HealthStatus | null;
  health_score: number | null;
  summary: string | null;
  risk_level: RiskLevel | null;
  issues: PlantIssue[];
  treatments: TreatmentStep[];
  care_tips: string[];
  needs_isolation: boolean;
  needs_pruning: boolean;
  needs_root_check: boolean;
  consult_expert: boolean;
  followups: FollowUp[];
  special_mode: PlantMode | null;
  special_analysis: AroidAnalysis | BonsaiAnalysis | null;
  recovery: { trend: RecoveryTrend; vs_diagnosis_id?: string; notes?: string } | null;
  raw_result: DiagnosisResult | null;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  plant_id: string;
  user_id: string;
  entry_type: "note" | "photo" | "watering" | "fertilizing" | "treatment" | "diagnosis";
  title: string | null;
  body: string | null;
  photo_url: string | null;
  created_at: string;
}

// Reminder yang dihitung dinamis (tidak disimpan)
export interface Reminder {
  plant_id: string;
  plant_name: string;
  cover_photo_url: string | null;
  type: "watering" | "fertilizing" | "followup" | "treatment";
  label: string;
  due_date: string; // ISO
  overdue: boolean;
}

export interface PlantWithLatest extends PlantRow {
  latest_diagnosis?: DiagnosisRow | null;
  diagnosis_count?: number;
}
