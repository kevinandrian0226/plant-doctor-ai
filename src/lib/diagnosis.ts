import type { DiagnosisResult } from "./types";
import type { ScanRecord } from "./db-types";

// ai_result_json scan diagnosa = DiagnosisResult lengkap
export function scanResult(scan: ScanRecord): DiagnosisResult | null {
  const j = scan.ai_result_json as any;
  if (j && typeof j === "object" && "species_name" in j) return j as DiagnosisResult;
  return null;
}

export function isDiagnosisScan(scan: ScanRecord): boolean {
  const j = scan.ai_result_json as any;
  return !!(j && typeof j === "object" && "species_name" in j);
}
