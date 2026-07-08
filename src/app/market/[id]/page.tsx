import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Leaf, MapPin, MessageCircle, ArrowRight, Tag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ListingOwnerActions } from "@/components/ListingOwnerActions";
import type { ListingRecord } from "@/lib/db-types";

export const dynamic = "force-dynamic";

function rupiah(n: number) { return "Rp " + (n || 0).toLocaleString("id-ID"); }

async function load(id: string) {
  const supabase = createClient();
  const { data } = await supabase.from("listings").select("*").eq("id", id).maybeSingle();
  return data as ListingRecord | null;
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const l = await load(params.id);
  if (!l) return { title: "Iklan tidak ditemukan — Plant Doctor AI" };
  const title = `${l.title} — ${rupiah(l.price)} | Marketplace Plant Doctor AI`;
  return {
    title,
    description: l.description || "Tanaman dijual di Plant Doctor AI Marketplace.",
    openGraph: { title, description: l.description || "", images: l.photo_url ? [{ url: l.photo_url }] : undefined },
    twitter: { card: "summary_large_image", title, images: l.photo_url ? [l.photo_url] : undefined },
  };
}

export default async function ListingPage({ params }: { params: { id: string } }) {
  const l = await load(params.id);
  if (!l) notFound();
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isOwner = !!user && user.id === l.user_id;
  const wa = (l.whatsapp || "").replace(/[^0-9]/g, "");
  const waIntl = wa.startsWith("0") ? "62" + wa.slice(1) : wa.startsWith("62") ? wa : wa ? "62" + wa : "";
  const waLink = waIntl
    ? `https://wa.me/${waIntl}?text=${encodeURIComponent(`Halo, saya tertarik dengan "${l.title}" (${rupiah(l.price)}) di Plant Doctor AI Marketplace.`)}`
    : null;

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-charcoal">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 py-5">
        <Link href="/market" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-leaf-700 text-white shadow-soft ring-1 ring-gold-300/30"><Leaf className="h-5 w-5" /></span>
          <span className="text-lg font-bold tracking-tight">Marketplace</span>
        </Link>
        <Link href="/market" className="btn-secondary">Semua iklan</Link>
      </header>

      <main className="mx-auto max-w-3xl px-5 pb-20">
        <div className="card-lux overflow-hidden p-0">
          <div className="relative aspect-[16/11] w-full bg-sage-100 dark:bg-white/5">
            {l.photo_url ? (
              <Image src={l.photo_url} alt={l.title} fill className="object-cover" sizes="(max-width:768px) 100vw, 768px" priority />
            ) : (
              <div className="flex h-full items-center justify-center text-charcoal-muted"><Leaf className="h-16 w-16" /></div>
            )}
            {l.status === "sold" && <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-2xl font-bold text-white">TERJUAL</span>}
          </div>
          <div className="p-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-sheen px-3 py-1 text-sm font-bold text-leaf-950"><Tag className="h-4 w-4" /> {rupiah(l.price)}</span>
            <h1 className="display-title mt-3 text-3xl">{l.title}</h1>
            {l.city && <p className="mt-1 flex items-center gap-1 text-sm text-charcoal-muted"><MapPin className="h-4 w-4" /> {l.city}</p>}
            {l.description && <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-charcoal-light dark:text-sage-200">{l.description}</p>}

            <div className="mt-6">
              {l.status === "available" && waLink ? (
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-primary w-full justify-center bg-[#25D366] hover:bg-[#1fb457]">
                  <MessageCircle className="h-5 w-5" /> Hubungi penjual via WhatsApp
                </a>
              ) : l.status === "sold" ? (
                <p className="text-center text-sm text-charcoal-muted">Tanaman ini sudah terjual.</p>
              ) : (
                <p className="text-center text-sm text-charcoal-muted">Kontak penjual belum tersedia.</p>
              )}
            </div>

            {isOwner && <ListingOwnerActions id={l.id} status={l.status} />}
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 rounded-3xl bg-gradient-to-br from-leaf-800 to-leaf-700 p-8 text-center text-white">
          <p className="display-title text-lg">Mau jual tanamanmu juga?</p>
          <Link href="/market/new" className="btn-gold">Pasang iklan gratis <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </main>
    </div>
  );
}
