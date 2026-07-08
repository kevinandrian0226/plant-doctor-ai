import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Leaf, Store, MapPin, ArrowRight, Tag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { ListingRecord } from "@/lib/db-types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Marketplace Tanaman | Plant Doctor AI",
  description: "Jual beli tanaman hias premium & rare dari komunitas kolektor.",
};

function rupiah(n: number) {
  return "Rp " + (n || 0).toLocaleString("id-ID");
}

export default async function MarketPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data } = await supabase
    .from("listings").select("*").eq("status", "available").order("created_at", { ascending: false }).limit(60);
  const listings = (data || []) as ListingRecord[];

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-charcoal">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-leaf-700 text-white shadow-soft ring-1 ring-gold-300/30"><Leaf className="h-5 w-5" /></span>
          <span className="text-lg font-bold tracking-tight">Plant Doctor <span className="text-gold-600 dark:text-gold-300">AI</span></span>
        </Link>
        <Link href={user ? "/market/new" : "/register"} className="btn-primary"><Store className="h-4 w-4" /> Jual Tanaman</Link>
      </header>

      <section className="mx-auto max-w-6xl px-5">
        <div className="text-center">
          <span className="eyebrow-gold"><Store className="h-3.5 w-3.5" /> Marketplace</span>
          <h1 className="display-title mt-3 text-3xl sm:text-4xl">Jual beli tanaman koleksi</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm text-charcoal-muted">Temukan aroid, monstera langka, anthurium & bonsai dari sesama kolektor. Hubungi penjual langsung.</p>
        </div>

        {listings.length === 0 ? (
          <div className="card mx-auto mt-12 max-w-md text-center">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-leaf-50 text-leaf-600 dark:bg-white/5"><Store className="h-7 w-7" /></span>
            <p className="font-semibold">Belum ada tanaman dijual</p>
            <p className="mt-1 text-sm text-charcoal-muted">Jadilah penjual pertama di marketplace!</p>
            <Link href={user ? "/market/new" : "/register"} className="btn-primary mt-4">Pasang iklan <ArrowRight className="h-4 w-4" /></Link>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {listings.map((l) => (
              <Link key={l.id} href={`/market/${l.id}`} className="group card-lux overflow-hidden p-0">
                <div className="relative aspect-square w-full bg-sage-100 dark:bg-white/5">
                  {l.photo_url ? (
                    <Image src={l.photo_url} alt={l.title} fill className="object-cover transition group-hover:scale-105" sizes="(max-width:640px) 50vw, 25vw" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-charcoal-muted"><Leaf className="h-10 w-10" /></div>
                  )}
                  <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-gold-sheen px-2 py-0.5 text-[11px] font-bold text-leaf-950"><Tag className="h-3 w-3" /> {rupiah(l.price)}</span>
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-semibold">{l.title}</p>
                  <p className="flex items-center gap-1 truncate text-xs text-charcoal-muted"><MapPin className="h-3 w-3" /> {l.city || "-"}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
        <div className="mx-auto mt-16 max-w-6xl pb-20">
          <div className="flex flex-col items-center gap-4 rounded-3xl bg-gradient-to-br from-leaf-800 to-leaf-700 p-10 text-center text-white">
            <h2 className="display-title text-2xl">Punya tanaman untuk dijual?</h2>
            <p className="max-w-md text-leaf-50/85">Pasang iklan gratis, pembeli menghubungimu langsung via WhatsApp.</p>
            <Link href={user ? "/market/new" : "/register"} className="btn-gold">Pasang Iklan <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
