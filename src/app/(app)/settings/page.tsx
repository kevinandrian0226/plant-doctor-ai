import { createClient } from "@/lib/supabase/server";
import { SettingsClient } from "@/components/SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const fullName = (user?.user_metadata?.full_name as string) || "";
  const email = user?.email || "";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pengaturan</h1>
        <p className="text-sm text-gray-500">Kelola profil, tampilan, dan datamu.</p>
      </div>
      <SettingsClient email={email} fullName={fullName} />
    </div>
  );
}
