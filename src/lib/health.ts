import type { HealthStatus } from "./types";

// Derive status kesehatan dari health_score (skema baru tak menyimpan status di plants)
export function statusFromScore(score: number | null | undefined): HealthStatus | "unknown" {
  if (score == null) return "unknown";
  if (score >= 80) return "healthy";
  if (score >= 55) return "mild";
  if (score >= 30) return "serious";
  return "critical";
}
