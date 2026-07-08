"use client";

import { useState } from "react";
import { Globe, Lock, Loader2, Link2, Check, ExternalLink } from "lucide-react";
import Link from "next/link";

export function ShareToggle({
  plantId,
  initialPublic,
}: {
  plantId: string;
  initialPublic: boolean;
}) {
  const [isPublic, setIsPublic] = useState(initialPublic);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const publicUrl =
    typeof window !== "undefined" ? `${window.location.origin}/p/${plantId}` : `/p/${plantId}`;

  const toggle = async () => {
    if (busy) return;
    setBusy(true);
    const next = !isPublic;
    try {
      const res = await fetch(`/api/plants/${plantId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_public: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error);
      setIsPublic(data.is_public);
    } catch {
      /* keep previous */
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
              isPublic
                ? "bg-leaf-100 text-leaf-700 dark:bg-leaf-900/40 dark:text-leaf-300"
                : "bg-sage-100 text-charcoal-muted dark:bg-white/5"
            }`}
          >
            {isPublic ? <Globe className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
          </span>
          <div>
            <p className="text-sm font-semibold">{isPublic ? "Publik" : "Privat"}</p>
            <p className="text-xs text-charcoal-muted">
              {isPublic ? "Tampil di Explore & bisa dibagikan" : "Hanya kamu yang bisa lihat"}
            </p>
          </div>
        </div>
        <button
          onClick={toggle}
          disabled={busy}
          className={`relative h-7 w-12 shrink-0 rounded-full transition ${
            isPublic ? "bg-leaf-600" : "bg-sage-300 dark:bg-white/15"
          } disabled:opacity-60`}
          aria-label="Bagikan ke publik"
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
              isPublic ? "left-6" : "left-1"
            }`}
          >
            {busy && <Loader2 className="h-5 w-5 animate-spin p-0.5 text-leaf-600" />}
          </span>
        </button>
      </div>

      {isPublic && (
        <div className="flex flex-wrap gap-2">
          <button onClick={copy} className="btn-secondary flex-1 justify-center">
            {copied ? <Check className="h-4 w-4 text-leaf-600" /> : <Link2 className="h-4 w-4" />}
            {copied ? "Tersalin!" : "Salin link"}
          </button>
          <Link href={`/p/${plantId}`} className="btn-secondary flex-1 justify-center" target="_blank">
            <ExternalLink className="h-4 w-4" /> Lihat halaman publik
          </Link>
        </div>
      )}
    </div>
  );
}
