// Tipe baris untuk skema ternormalisasi (schema_normalized.sql)

export type ScanStatus = "pending" | "completed" | "failed";
export type ReminderType = "watering" | "fertilizer" | "treatment" | "follow_up_scan";
export type TreatmentStatus = "pending" | "in_progress" | "completed";
export type DbPhotoType = "whole_plant" | "leaf" | "stem" | "root" | "soil" | "other";

export interface PlantRecord {
  id: string;
  user_id: string;
  nickname: string | null;
  common_name: string | null;
  scientific_name: string | null;
  category: string | null;
  location: string | null;
  pot_size: string | null;
  growing_medium: string | null;
  watering_frequency: string | null;
  fertilizer_schedule: string | null;
  light_condition: string | null;
  qr_code_url: string | null;
  is_public: boolean;
  shared_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScanRecord {
  id: string;
  user_id: string;
  plant_id: string | null;
  status: ScanStatus;
  ai_result_json: unknown | null;
  health_score: number | null;
  risk_level: string | null;
  summary: string | null;
  created_at: string;
}

export interface PlantPhotoRecord {
  id: string;
  plant_id: string;
  scan_id: string | null;
  photo_url: string;
  photo_type: DbPhotoType;
  uploaded_at: string;
}

export interface DiagnosisRecord {
  id: string;
  scan_id: string;
  plant_id: string | null;
  issue_name: string;
  issue_type: string | null;
  confidence: number | null;
  severity: string | null;
  description: string | null;
  created_at: string;
}

export interface TreatmentRecord {
  id: string;
  plant_id: string;
  scan_id: string | null;
  title: string;
  instructions: string | null;
  status: TreatmentStatus;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface ReminderRecord {
  id: string;
  user_id: string;
  plant_id: string | null;
  title: string;
  reminder_type: ReminderType;
  due_date: string | null;
  repeat_rule: string | null;
  is_done: boolean;
  created_at: string;
}

// Kolom profil tanaman yang boleh dibuat/diupdate via API
export const PLANT_FIELDS = [
  "nickname",
  "common_name",
  "scientific_name",
  "category",
  "location",
  "pot_size",
  "growing_medium",
  "watering_frequency",
  "fertilizer_schedule",
  "light_condition",
  "qr_code_url",
] as const;
