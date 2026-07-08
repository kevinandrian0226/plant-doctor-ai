import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Leaf, Sparkles, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { HealthScore } from "@/components/HealthScore";
import { HealthBadge } from "@/components/HealthBadge";
import { RiskBadge } from "@/components/RiskBadge";
import { LikeButton } from "@/components/LikeButton";
import { statusFromScore } from "@/lib/health";
import type { PlantRecord, ScanRecord, PlantPhotoRecord } from "@/lib/db-types";

export const dynamic = "force-dynamic";

async function loadPlant(id: string) {
  const supabase = createClient();
  const { data: plant } = await supabase
    .from("plants")
    .select("*")
    .eq("id", id)
    .eq("is_public", true)
    .maybeSingle();
  return plant as PlantRecord | null;
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const plant = await loadPlant(params.id);
  if (!plant) return { title: "Tanaman tidak ditemukan — Plant Doctor AI" };
  const supabase = createClient();
  const { data: photo } = await supabase
    .from("plant_photos")
    .select("photo_url")
    .eq("plant_id", params.id)
    .order("uploaded_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const name = plant.nickname || plant.common_name || "Tanaman";
  const title = `${name} — koleksi di Plant Doctor AI`;
  const description = plant.scientific_name
    ? `${plant.common_name || name} (${plant.scientific_name}) · ${plant.category || "tanaman hias"}`
    : "Lihat koleksi tanaman ini di Plant Doctor AI.";
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: photo?.photo_url ? [{ url: photo.photo_url }] : undefined,
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description, images: photo?.photo_url ? [photo.photo_url] : undefined },
  };
}

export default async function PublicPlantPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const plant = await loadPlant(params.id);
  if (!plant) notFound();

  const [{ data: photos }, { data: scans }, { data: { user } }, { count: likeCount }] =
    await Promise.all([
      supabase.from("plant_photos").select("*").eq("plant_id", params.id).order("uploaded_at", { ascending: false }),
      supabase.from("scans").select("*").eq("plant_id", params.id).eq("status", "completed").order("created_at", { ascending: false }),
      supabase.auth.getUser(),
      supabase.from("plant_likes").select("id", { count: "exact", head: true }).eq("plant_id", params.id),
    ]);

  const ph = (photos || []) as PlantPhotoRecord[];
  const cover = ph.find((p) => p.photo_type === "whole_plant")?.photo_url || ph[0]?.photo_url || null;
  const latest = ((scans || []) as ScanRecord[])[0];
  const name = plant.nickname || plant.common_name || "Tanaman";

  let liked = false;
  if (user) {
    const { data: myLike } = await supabase
      .from("plant_likes")
      .select("id")
      .eq("plant_id", params.id)
      .eq("user_id", user.id)
      .maybeSingle();
    liked = !!myLike;
  }

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-charcoal">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-leaf-700 text-white shadow-soft ring-1 ring-gold-300/30"><Leaf className="h-5 w-5" /></span>
          <span className="text-lg font-bold tracking-tight">Plant Doctor <span className="text-gold-600 dark:text-gold-300">AI</span></span>
        </Link>
        <Link href="/explore" className="btn-secondary">Explore</Link>
      </header>

      <main className="mx-auto max-w-3xl px-5 pb-20">
        <div className="card-lux overflow-hidden p-0">
          <div className="relative aspect-[16/10] w-full bg-sage-100 dark:bg-white/5">
            {cover ? (
              <Image src={cover} alt={name} fill className="object-cover" sizes="(max-width:768px) 100vw, 768px" priority />
            ) : (
              <div className="flex h-full items-center justify-center text-charcoal-muted"><Leaf className="h-16 w-16" /></div>
            )}
            <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-gold-300" /> {plant.category || "Tanaman hias"}
            </span>
          </div>
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="display-title text-3xl">{name}</h1>
                {plant.scientific_name && <p className="mt-0.5 italic text-charcoal-muted">{plant.scientific_name}</p>}
              </div>
              {latest?.health_score != null && <HealthScore score={latest.health_score} size={72} />}
            </div>

            {latest && (
              <div className="mt-4 flex flex-wrap gap-2">
                <HealthBadge status={statusFromScore(latest.health_score)} />
                {latest.risk_level && <RiskBadge level={latest.risk_level as never} />}
              </div>
            )}
            {latest?.summary && <p className="mt-4 text-sm leading-relaxed text-charcoal-light dark:text-sage-200">{latest.summary}</p>}

            <div className="mt-6 flex items-center gap-3">
              <LikeButton plantId={plant.id} initialLiked={liked} initialCount={likeCount ?? 0} canLike={!!user} />
              <span className="text-xs text-charcoal-muted">Suka koleksi ini? Beri hati.</span>
            </div>
          </div>
        </div>

        {ph.length > 1 && (
          <div className="mt-6 grid grid-cols-3 gap-3">
            {ph.slice(0, 6).map((p) => (
              <div key={p.id} className="relative aspect-square overflow-hidden rounded-2xl bg-sage-100 dark:bg-white/5">
                <Image src={p.photo_url} alt="" fill className="object-cover" sizes="200px" />
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-col items-center gap-4 rounded-3xl bg-gradient-to-br from-leaf-800 to-leaf-700 p-8 text-center text-white">
          <p className="display-title text-xl">Punya tanaman juga? Diagnosa gratis dengan AI.</p>
          <Link href="/register" className="btn-gold">Coba Plant Doctor AI <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </main>
    </div>
  );
}
