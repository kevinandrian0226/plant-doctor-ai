import { BellRing, ScanLine } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { RemindersView } from "@/components/RemindersView";
import { EmptyState } from "@/components/ui/States";
import type { PlantRecord, PlantPhotoRecord, ReminderRecord } from "@/lib/db-types";
import type { ReminderItem } from "@/components/ReminderList";

export const dynamic = "force-dynamic";

export default async function RemindersPage() {
  const supabase = createClient();
  const [{ data: rData }, { data: pData }, { data: phData }] = await Promise.all([
    supabase.from("reminders").select("*").eq("is_done", false).order("due_date", { ascending: true }),
    supabase.from("plants").select("*").order("updated_at", { ascending: false }),
    supabase.from("plant_photos").select("*").order("uploaded_at", { ascending: false }),
  ]);
  const reminders = (rData || []) as ReminderRecord[];
  const plants = (pData || []) as PlantRecord[];
  const photos = (phData || []) as PlantPhotoRecord[];

  const plantById = new Map(plants.map((p) => [p.id, p]));
  const cover = new Map<string, string>();
  for (const ph of photos) if (!cover.has(ph.plant_id)) cover.set(ph.plant_id, ph.photo_url);

  const items: ReminderItem[] = reminders.map((r) => ({
    id: r.id, plant_id: r.plant_id,
    plant_name: (r.plant_id && (plantById.get(r.plant_id)?.nickname || plantById.get(r.plant_id)?.common_name)) || r.title,
    cover: r.plant_id ? cover.get(r.plant_id) || null : null,
    title: r.title, reminder_type: r.reminder_type, due_date: r.due_date,
  }));
  const plantOpts = plants.map((p) => ({ id: p.id, name: p.nickname || p.common_name || "Tanaman" }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold"><BellRing className="h-6 w-6 text-leaf-600" /> Reminder</h1>
          <p className="text-sm text-charcoal-muted">Jadwal siram, pupuk, treatment, dan follow-up scan.</p>
        </div>
        <Link href="/scan" className="btn-secondary"><ScanLine className="h-4 w-4" /> Scan</Link>
      </div>
      {plants.length === 0 && items.length === 0 ? (
        <EmptyState icon={BellRing} title="Belum ada reminder" description="Scan tanaman & buat reminder perawatan untuk melihatnya di sini." action={{ label: "Scan Tanaman", href: "/scan", icon: ScanLine }} />
      ) : (
        <RemindersView reminders={items} plants={plantOpts} />
      )}
    </div>
  );
}
