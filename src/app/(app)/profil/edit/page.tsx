import { createClient } from "@/lib/supabase/server";
import { ProfileSettings } from "@/components/ProfileSettings";

export const dynamic = "force-dynamic";

export default async function ProfilEditPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data } = await supabase.from("users").select("handle, bio, is_public").eq("id", user!.id).maybeSingle();
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="display-title text-3xl">Profil Publik</h1>
        <p className="mt-1 text-sm text-charcoal-muted">Buat etalase koleksimu yang bisa dibagikan & diikuti.</p>
      </div>
      <ProfileSettings initial={{ handle: (data?.handle as string) || "", bio: (data?.bio as string) || "", is_public: Boolean(data?.is_public) }} />
    </div>
  );
}
