import { Stethoscope } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ConsultForm } from "@/components/ConsultForm";
import type { PlantRecord } from "@/lib/db-types";

export const dynamic = "force-dynamic";

export default async function KonsultasiPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data } = await supabase.from("plants").select("id, nickname, common_name").eq("user_id", user?.id ?? "").order("updated_at", { ascending: false });
  const plants = ((data || []) as Partial<PlantRecord>[]).map((p) => ({
    id: p.id as string,
    name: (p.nickname || p.common_name || "Tanaman") as string,
  }));

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="text-center">
        <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-3xl bg-leaf-700 text-white shadow-soft ring-1 ring-gold-300/30"><Stethoscope className="h-7 w-7" /></span>
        <h1 className="display-title text-3xl">Konsultasi Ahli</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-charcoal-muted">Butuh pendapat pakar untuk tanaman rare atau kasus serius? Kirim permintaan, ahli kami akan menghubungimu.</p>
      </div>
      <ConsultForm plants={plants} />
    </div>
  );
}
