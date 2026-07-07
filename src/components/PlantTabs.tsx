"use client";

import { useState } from "react";
import Image from "next/image";
import { LayoutGrid, Stethoscope, ListChecks, Camera, RefreshCw, QrCode } from "lucide-react";
import { DiagnosisResultView } from "./DiagnosisResultView";
import { PlantProfileForm } from "./PlantProfileForm";
import { RecoveryTracker } from "./RecoveryTracker";
import { QRCodeCard } from "./QRCodeCard";
import { TreatmentTab } from "./TreatmentTab";
import { HealthBadge } from "./HealthBadge";
import { HealthScore } from "./HealthScore";
import { ProgressChart } from "./ProgressChart";
import { scanResult, isDiagnosisScan } from "@/lib/diagnosis";
import { statusFromScore } from "@/lib/health";
import { formatDate, cn } from "@/lib/utils";
import type { PlantRecord, ScanRecord, PlantPhotoRecord, TreatmentRecord } from "@/lib/db-types";

type Tab = "overview" | "diagnoses" | "treatments" | "photos" | "recovery" | "qr";
const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Ikhtisar", icon: LayoutGrid },
  { id: "diagnoses", label: "Diagnosa", icon: Stethoscope },
  { id: "treatments", label: "Treatment", icon: ListChecks },
  { id: "photos", label: "Foto", icon: Camera },
  { id: "recovery", label: "Recovery", icon: RefreshCw },
  { id: "qr", label: "QR", icon: QrCode },
];
const VALID: Tab[] = ["overview", "diagnoses", "treatments", "photos", "recovery", "qr"];

export function PlantTabs({
  plant, scans, photos, treatments, initialTab = "overview",
}: { plant: PlantRecord; scans: ScanRecord[]; photos: PlantPhotoRecord[]; treatments: TreatmentRecord[]; initialTab?: string }) {
  const [tab, setTab] = useState<Tab>(VALID.includes(initialTab as Tab) ? (initialTab as Tab) : "overview");
  const plantName = plant.nickname || plant.common_name || "Tanaman";
  const diagnosisScans = scans.filter(isDiagnosisScan);
  const latest = diagnosisScans[0];
  const latestResult = latest ? scanResult(latest) : null;
  const coverFor = (scanId: string) =>
    photos.find((p) => p.scan_id === scanId && p.photo_type === "whole_plant")?.photo_url ||
    photos.find((p) => p.scan_id === scanId)?.photo_url || null;
  const progress = [...diagnosisScans].reverse().map((s) => ({ score: s.health_score || 0 }));

  return (
    <div className="space-y-5">
      <div className="flex gap-1 overflow-x-auto rounded-2xl bg-sage-100 p-1 dark:bg-white/5">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn("flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition",
              tab === t.id ? "bg-white text-leaf-800 shadow-sm dark:bg-charcoal dark:text-leaf-300" : "text-charcoal-muted hover:text-leaf-600")}>
            <t.icon className="h-4 w-4" /><span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Info label="Nama umum" value={plant.common_name || "-"} />
            <Info label="Nama ilmiah" value={plant.scientific_name || "-"} italic />
            <Info label="Kategori" value={plant.category || "-"} />
            <Info label="Lokasi" value={plant.location || "-"} />
            <Info label="Ukuran pot" value={plant.pot_size || "-"} />
            <Info label="Media tanam" value={plant.growing_medium || "-"} />
            <Info label="Frekuensi siram" value={plant.watering_frequency || "-"} />
            <Info label="Jadwal pupuk" value={plant.fertilizer_schedule || "-"} />
          </div>
          {progress.length > 1 && (
            <div className="card"><h3 className="mb-3 eyebrow">Progress Kesehatan</h3><ProgressChart data={progress} /></div>
          )}
          <div><h3 className="mb-2 eyebrow">Edit Profil</h3><PlantProfileForm plant={plant} /></div>
        </div>
      )}

      {tab === "diagnoses" && (
        <div className="space-y-5">
          {latest && latestResult ? (
            <>
              <div className="flex items-center justify-between">
                <h3 className="eyebrow">Diagnosa Terbaru</h3>
                <span className="text-xs text-charcoal-muted">{formatDate(latest.created_at)}</span>
              </div>
              <DiagnosisResultView result={latestResult} photoUrl={coverFor(latest.id)} />
              {diagnosisScans.length > 1 && (
                <div>
                  <h3 className="mb-2 eyebrow">Riwayat Sebelumnya</h3>
                  <div className="space-y-3">
                    {diagnosisScans.slice(1).map((d) => (
                      <div key={d.id} className="card flex gap-4">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-sage-100">
                          {coverFor(d.id) && <Image src={coverFor(d.id) as string} alt="" fill className="object-cover" sizes="64px" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <HealthBadge status={statusFromScore(d.health_score)} />
                            <span className="text-xs text-charcoal-muted">{formatDate(d.created_at)}</span>
                          </div>
                          <p className="mt-1 line-clamp-2 text-sm text-charcoal-muted">{d.summary}</p>
                        </div>
                        <div className="self-center"><HealthScore score={d.health_score || 0} size={56} /></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="card text-center text-sm text-charcoal-muted">Belum ada diagnosa.</div>
          )}
        </div>
      )}

      {tab === "treatments" && <TreatmentTab treatments={treatments} />}

      {tab === "photos" && (
        photos.length === 0 ? (
          <div className="card text-center text-sm text-charcoal-muted">Belum ada foto.</div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((ph) => (
              <div key={ph.id} className="relative aspect-square overflow-hidden rounded-2xl bg-sage-100">
                <Image src={ph.photo_url} alt={ph.photo_type} fill className="object-cover" sizes="200px" />
                <span className="absolute bottom-1.5 left-1.5 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-medium text-white">{ph.photo_type.replace("_", " ")}</span>
              </div>
            ))}
          </div>
        )
      )}

      {tab === "recovery" && (
        <RecoveryTracker plantId={plant.id} hasPrevious={diagnosisScans.length > 0} previousPhoto={latest ? coverFor(latest.id) : null} previousScore={latest?.health_score ?? undefined} />
      )}

      {tab === "qr" && <QRCodeCard plantId={plant.id} plantName={plantName} />}
    </div>
  );
}

function Info({ label, value, italic }: { label: string; value: string; italic?: boolean }) {
  return (
    <div className="card py-3">
      <p className="text-[11px] uppercase tracking-wide text-charcoal-muted">{label}</p>
      <p className={cn("text-sm font-medium text-charcoal dark:text-sage-50", italic && "italic")}>{value}</p>
    </div>
  );
}
