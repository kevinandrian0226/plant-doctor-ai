import Link from "next/link";
import Image from "next/image";
import { Sprout, Activity, AlertTriangle, Leaf, BellRing, ScanLine, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PlantCard } from "@/components/PlantCard";
import { ReminderList, type ReminderItem } from "@/components/ReminderList";
import { HealthBadge } from "@/components/HealthBadge";
import { RiskBadge } from "@/components/RiskBadge";
import { EmptyState } from "@/components/ui/States";
import { isDiagnosisScan } from "@/lib/diagnosis";
import { statusFromScore } from "@/lib/health";
import { formatDate } from "@/lib/utils";
import type { PlantRecord, ScanRecord, PlantPhotoRecord, ReminderRecord } from "@/lib/db-types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: pData }, { data: sData }, { data: phData }, { data: rData }] = await Promise.all([
    supabase.from("plants").select("*").order("updated_at", { ascending: false }),
    supabase.from("scans").select("*").order("created_at", { ascending: false }),
    supabase.from("plant_photos").select("*").order("uploaded_at", { ascending: false }),
    supabase.from("reminders").select("*").eq("is_done", false).order("due_date", { ascending: true }).limit(6),
  ]);
  const plants = (pData || []) as PlantRecord[];
  const scans = (sData || []) as ScanRecord[];
  const photos = (phData || []) as PlantPhotoRecord[];
  const reminders = (rData || []) as ReminderRecord[];

  const latestScanByPlant = new Map<string, ScanRecord>();
  for (const s of scans) if (s.plant_id && isDiagnosisScan(s) && !latestScanByPlant.has(s.plant_id)) latestScanByPlant.set(s.plant_id, s);
  const coverByPlant = new Map<string, string>();
  for (const ph of photos) if (!coverByPlant.has(ph.plant_id)) coverByPlant.set(ph.plant_id, ph.photo_url);
  const plantById = new Map(plants.map((p) => [p.id, p]));

  const diagnosisScans = scans.filter(isDiagnosisScan);
  const latest = diagnosisScans[0];
  const latestPlant = latest?.plant_id ? plantById.get(latest.plant_id) : undefined;

  const total = plants.length;
  const healthy = plants.filter((p) => (latestScanByPlant.get(p.id)?.health_score ?? 0) >= 75).length;
  const needCare = plants.filter((p) => {
    const sc = latestScanByPlant.get(p.id);
    return sc && ((sc.health_score ?? 100) < 55 || sc.risk_level === "high" || sc.risk_level === "emergency");
  }).length;

  const reminderItems: ReminderItem[] = reminders.map((r) => ({
    id: r.id, plant_id: r.plant_id,
    plant_name: (r.plant_id && plantById.get(r.plant_id)?.nickname) || (r.plant_id && plantById.get(r.plant_id)?.common_name) || r.title,
    cover: r.plant_id ? coverByPlant.get(r.plant_id) || null : null,
    title: r.title, reminder_type: r.reminder_type, due_date: r.due_date,
  }));

  const name = (user?.user_metadata?.full_name as string) || user?.email?.split("@")[0] || "Plant Lover";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="display-title text-3xl">Halo, {name} 🌿</h1>
          <p className="mt-0.5 text-sm text-charcoal-muted">Pantau kesehatan koleksi tanamanmu.</p>
        </div>
        <Link href="/scan" className="btn-primary"><ScanLine className="h-4 w-4" /> Scan New Plant</Link>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat icon={Sprout} label="Total Tanaman" value={total} tone="leaf" />
        <Stat icon={Activity} label="Sehat" value={healthy} tone="green" />
        <Stat icon={AlertTriangle} label="Perlu Perhatian" value={needCare} tone="amber" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 eyebrow">Diagnosis Terakhir</h2>
          {latest && latestPlant ? (
            <Link href={`/plants/${latest.plant_id}`} className="card group flex gap-4 transition hover:shadow-lift">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-sage-100 dark:bg-white/5">
                {latestPlant && coverByPlant.get(latestPlant.id) && <Image src={coverByPlant.get(latestPlant.id) as string} alt="" fill className="object-cover transition group-hover:scale-105" sizes="96px" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-charcoal dark:text-sage-50">{latestPlant.nickname || latestPlant.common_name}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <HealthBadge status={statusFromScore(latest.health_score)} />
                  <RiskBadge level={latest.risk_level} />
                </div>
                <p className="mt-1.5 text-[11px] text-charcoal-muted">{formatDate(latest.created_at)}</p>
              </div>
              <ArrowRight className="h-4 w-4 self-center text-gray-300 transition group-hover:translate-x-1 group-hover:text-leaf-500" />
            </Link>
          ) : (
            <EmptyState icon={Leaf} title="Belum ada diagnosis" description="Mulai scan tanaman pertamamu." action={{ label: "Scan Sekarang", href: "/scan", icon: ScanLine }} />
          )}
        </section>

        <section>
          <h2 className="mb-3 flex items-center gap-2 eyebrow"><BellRing className="h-4 w-4" /> Reminder Treatment</h2>
          <ReminderList reminders={reminderItems} />
        </section>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="eyebrow">Koleksi Tanaman</h2>
          {total > 0 && <Link href="/plants" className="text-xs font-semibold text-leaf-600 hover:underline">Lihat semua</Link>}
        </div>
        {total === 0 ? (
          <EmptyState icon={Sprout} title="Belum ada tanaman" description="Mulai dengan scan tanaman pertamamu." action={{ label: "Scan Tanaman Pertama", href: "/scan", icon: ScanLine }} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {plants.slice(0, 6).map((p) => {
              const sc = latestScanByPlant.get(p.id);
              return <PlantCard key={p.id} item={{ id: p.id, name: p.nickname || p.common_name || "Tanaman", species: p.common_name, cover: coverByPlant.get(p.id) || null, status: sc ? statusFromScore(sc.health_score) : undefined, risk: sc?.risk_level, updatedAt: p.updated_at }} />;
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone }: { icon: React.ElementType; label: string; value: number; tone: "leaf" | "green" | "amber" }) {
  const tones = {
    leaf: "bg-leaf-100 text-leaf-800 dark:bg-leaf-900/40 dark:text-leaf-300",
    green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  };
  return (
    <div className="card-lux flex flex-col items-center gap-1.5 py-4 text-center sm:flex-row sm:gap-3 sm:text-left">
      <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${tones[tone]}`}><Icon className="h-5 w-5" /></span>
      <div><p className="display-title text-2xl leading-none">{value}</p><p className="text-[11px] text-charcoal-muted">{label}</p></div>
    </div>
  );
}
