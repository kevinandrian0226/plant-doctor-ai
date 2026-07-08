import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Leaf, Heart, Compass, ArrowRight, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { PlantRecord, PlantPhotoRecord } from "@/lib/db-types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Explore — Koleksi Tanaman | Plant Doctor AI",
  description: "Jelajahi koleksi tanaman hias premium dari komunitas Plant Doctor AI.",
};

export default async function ExplorePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: plantsData } = await supabase
    .from("plants")
    .select("*")
    .eq("is_public", true)
    .order("shared_at", { ascending: false })
    .limit(48);
  const plants = (plantsData || []) as PlantRecord[];
  const ids = plants.map((p) => p.id);

  let photosData: Partial<PlantPhotoRecord>[] = [];
  let likesData: { plant_id: string }[] = [];
  if (ids.length) {
    const [pr, lr] = await Promise.all([
      supabase.from("plant_photos").select("plant_id, photo_url, photo_type, uploaded_at").in("plant_id", ids),
      supabase.from("plant_likes").select("plant_id").in("plant_id", ids),
    ]);
    photosData = (pr.data || []) as Partial<PlantPhotoRecord>[];
    likesData = (lr.data || []) as { plant_id: string }[];
  }

  const coverBy = new Map<string, string>();
  for (const ph of photosData) {
    if (!ph.plant_id || !ph.photo_url) continue;
    if (ph.photo_type === "whole_plant") coverBy.set(ph.plant_id, ph.photo_url);
    else if (!coverBy.has(ph.plant_id)) coverBy.set(ph.plant_id, ph.photo_url);
  }
  const likeCount = new Map<string, number>();
  for (const l of likesData) likeCount.set(l.plant_id, (likeCount.get(l.plant_id) || 0) + 1);

  const sorted = [...plants].sort((a, b) => (likeCount.get(b.id) || 0) - (likeCount.get(a.id) || 0));

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-charcoal">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-leaf-700 text-white shadow-soft ring-1 ring-gold-300/30"><Leaf className="h-5 w-5" /></span>
          <span className="text-lg font-bold tracking-tight">Plant Doctor <span className="text-gold-600 dark:text-gold-300">AI</span></span>
        </Link>
        <Link href={user ? "/dashboard" : "/register"} className="btn-primary">{user ? "Dashboard" : "Daftar"}</Link>
      </header>

      <section className="mx-auto max-w-6xl px-5">
        <div className="text-center">
          <span className="eyebrow-gold"><Compass className="h-3.5 w-3.5" /> Explore</span>
          <h1 className="display-title mt-3 text-3xl sm:text-4xl">Koleksi tanaman komunitas</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm text-charcoal-muted">Jelajahi tanaman hias premium yang dibagikan kolektor lain. Beri hati pada yang kamu suka.</p>
        </div>

        {sorted.length === 0 ? (
          <div className="card mx-auto mt-12 max-w-md text-center">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-leaf-50 text-leaf-600 dark:bg-white/5"><Sparkles className="h-7 w-7" /></span>
            <p className="font-semibold">Belum ada koleksi publik</p>
            <p className="mt-1 text-sm text-charcoal-muted">Jadilah yang pertama! Bagikan tanamanmu dari halaman detail tanaman.</p>
            <Link href={user ? "/plants" : "/register"} className="btn-primary mt-4">{user ? "Bagikan tanamanku" : "Mulai gratis"} <ArrowRight className="h-4 w-4" /></Link>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {sorted.map((p) => {
              const cover = coverBy.get(p.id);
              const name = p.nickname || p.common_name || "Tanaman";
              return (
                <Link key={p.id} href={`/p/${p.id}`} className="group card-lux overflow-hidden p-0">
                  <div className="relative aspect-square w-full bg-sage-100 dark:bg-white/5">
                    {cover ? (
                      <Image src={cover} alt={name} fill className="object-cover transition group-hover:scale-105" sizes="(max-width:640px) 50vw, 25vw" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-charcoal-muted"><Leaf className="h-10 w-10" /></div>
                    )}
                    <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur">
                      <Heart className="h-3 w-3 fill-current text-rose-400" /> {likeCount.get(p.id) || 0}
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="truncate text-sm font-semibold">{name}</p>
                    <p className="truncate text-xs text-charcoal-muted">{p.category || "Tanaman hias"}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <div className="mx-auto mt-16 max-w-6xl px-5 pb-20">
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-gradient-to-br from-leaf-800 to-leaf-700 p-10 text-center text-white">
          <h2 className="display-title text-2xl">Pamerkan koleksimu di sini</h2>
          <p className="max-w-md text-leaf-50/85">Diagnosa tanamanmu, lalu bagikan ke Explore hanya dengan satu tombol.</p>
          <Link href={user ? "/plants" : "/register"} className="btn-gold">{user ? "Ke koleksiku" : "Mulai Gratis"} <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </div>
    </div>
  );
}
