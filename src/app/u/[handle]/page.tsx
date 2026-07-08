import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Leaf, Users, Sprout, Store, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { FollowButton } from "@/components/FollowButton";
import type { PlantRecord, PlantPhotoRecord, ListingRecord } from "@/lib/db-types";

export const dynamic = "force-dynamic";

async function loadProfile(handle: string) {
  const supabase = createClient();
  const { data } = await supabase.from("public_profiles").select("*").eq("handle", handle).maybeSingle();
  return data as { id: string; handle: string; bio: string | null; avatar_url: string | null } | null;
}

export async function generateMetadata({ params }: { params: { handle: string } }): Promise<Metadata> {
  const p = await loadProfile(params.handle);
  if (!p) return { title: "Profil tidak ditemukan — Plant Doctor AI" };
  const title = `@${p.handle} — koleksi tanaman | Plant Doctor AI`;
  return { title, description: p.bio || `Lihat koleksi tanaman @${p.handle}.`, openGraph: { title, description: p.bio || "" } };
}

function rupiah(n: number) { return "Rp " + (n || 0).toLocaleString("id-ID"); }

export default async function ProfilePage({ params }: { params: { handle: string } }) {
  const supabase = createClient();
  const profile = await loadProfile(params.handle);
  if (!profile) notFound();

  const [{ data: pData }, { data: lData }, { data: { user } }, { count: followers }] = await Promise.all([
    supabase.from("plants").select("*").eq("user_id", profile.id).eq("is_public", true).order("shared_at", { ascending: false }),
    supabase.from("listings").select("*").eq("user_id", profile.id).eq("status", "available").order("created_at", { ascending: false }),
    supabase.auth.getUser(),
    supabase.from("follows").select("id", { count: "exact", head: true }).eq("following_id", profile.id),
  ]);
  const plants = (pData || []) as PlantRecord[];
  const listings = (lData || []) as ListingRecord[];
  const ids = plants.map((p) => p.id);
  let photos: Partial<PlantPhotoRecord>[] = [];
  if (ids.length) {
    const { data } = await supabase.from("plant_photos").select("plant_id, photo_url, photo_type").in("plant_id", ids);
    photos = (data || []) as Partial<PlantPhotoRecord>[];
  }
  const coverBy = new Map<string, string>();
  for (const ph of photos) { if (!ph.plant_id || !ph.photo_url) continue; if (ph.photo_type === "whole_plant") coverBy.set(ph.plant_id, ph.photo_url); else if (!coverBy.has(ph.plant_id)) coverBy.set(ph.plant_id, ph.photo_url); }

  let following = false;
  if (user && user.id !== profile.id) {
    const { data: f } = await supabase.from("follows").select("id").eq("follower_id", user.id).eq("following_id", profile.id).maybeSingle();
    following = !!f;
  }
  const isOwner = user?.id === profile.id;

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-charcoal">
      <header className="mx-auto flex max-w-4xl items-center justify-between px-5 py-5">
        <Link href="/explore" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-leaf-700 text-white shadow-soft ring-1 ring-gold-300/30"><Leaf className="h-5 w-5" /></span>
          <span className="text-lg font-bold tracking-tight">Plant Doctor <span className="text-gold-600 dark:text-gold-300">AI</span></span>
        </Link>
        <Link href="/explore" className="btn-secondary">Explore</Link>
      </header>

      <main className="mx-auto max-w-4xl px-5 pb-20">
        <div className="card-lux flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
          <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-leaf-700 text-2xl font-bold text-white">
            {profile.avatar_url ? <Image src={profile.avatar_url} alt="" width={80} height={80} className="h-full w-full object-cover" /> : profile.handle.slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="display-title text-2xl">@{profile.handle}</h1>
            {profile.bio && <p className="mt-1 text-sm text-charcoal-muted">{profile.bio}</p>}
            <div className="mt-2 flex items-center justify-center gap-4 text-sm text-charcoal-muted sm:justify-start">
              <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {followers ?? 0} pengikut</span>
              <span className="flex items-center gap-1"><Sprout className="h-4 w-4" /> {plants.length} tanaman</span>
            </div>
          </div>
          {isOwner ? (
            <Link href="/profil/edit" className="btn-secondary">Edit profil</Link>
          ) : (
            <FollowButton targetId={profile.id} initialFollowing={following} canFollow={!!user} />
          )}
        </div>

        {listings.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-3 flex items-center gap-2 eyebrow"><Store className="h-4 w-4" /> Dijual</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {listings.map((l) => (
                <Link key={l.id} href={`/market/${l.id}`} className="group card-lux overflow-hidden p-0">
                  <div className="relative aspect-square w-full bg-sage-100 dark:bg-white/5">
                    {l.photo_url ? <Image src={l.photo_url} alt={l.title} fill className="object-cover transition group-hover:scale-105" sizes="25vw" /> : <div className="flex h-full items-center justify-center text-charcoal-muted"><Leaf className="h-8 w-8" /></div>}
                    <span className="absolute left-2 top-2 rounded-full bg-gold-sheen px-2 py-0.5 text-[11px] font-bold text-leaf-950">{rupiah(l.price)}</span>
                  </div>
                  <div className="p-2.5"><p className="truncate text-xs font-semibold">{l.title}</p><p className="flex items-center gap-1 truncate text-[11px] text-charcoal-muted"><MapPin className="h-3 w-3" />{l.city || "-"}</p></div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mt-8">
          <h2 className="mb-3 flex items-center gap-2 eyebrow"><Sprout className="h-4 w-4" /> Koleksi</h2>
          {plants.length === 0 ? (
            <div className="card text-center text-sm text-charcoal-muted">Belum ada koleksi publik.</div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {plants.map((p) => (
                <Link key={p.id} href={`/p/${p.id}`} className="group card-lux overflow-hidden p-0">
                  <div className="relative aspect-square w-full bg-sage-100 dark:bg-white/5">
                    {coverBy.get(p.id) ? <Image src={coverBy.get(p.id) as string} alt="" fill className="object-cover transition group-hover:scale-105" sizes="25vw" /> : <div className="flex h-full items-center justify-center text-charcoal-muted"><Leaf className="h-8 w-8" /></div>}
                  </div>
                  <div className="p-2.5"><p className="truncate text-xs font-semibold">{p.nickname || p.common_name || "Tanaman"}</p><p className="truncate text-[11px] text-charcoal-muted">{p.category || "Tanaman hias"}</p></div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
