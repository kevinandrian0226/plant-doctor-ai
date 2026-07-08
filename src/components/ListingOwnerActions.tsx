"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Trash2, Loader2, RotateCcw } from "lucide-react";

export function ListingOwnerActions({ id, status }: { id: string; status: "available" | "sold" }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const setStatus = async (next: "available" | "sold") => {
    setBusy(true); setErr(null);
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error("Gagal memperbarui status.");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Gagal.");
    } finally { setBusy(false); }
  };

  const remove = async () => {
    if (!confirm("Hapus iklan ini secara permanen?")) return;
    setBusy(true); setErr(null);
    try {
      const res = await fetch(`/api/listings/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus iklan.");
      router.push("/market");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Gagal.");
      setBusy(false);
    }
  };

  return (
    <div className="mt-6 rounded-2xl border border-dashed border-black/10 p-4 dark:border-white/10">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-charcoal-muted">Kelola iklan (hanya kamu yang lihat)</p>
      <div className="flex flex-wrap gap-2">
        {status === "available" ? (
          <button onClick={() => setStatus("sold")} disabled={busy} className="btn-secondary text-sm">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Tandai terjual
          </button>
        ) : (
          <button onClick={() => setStatus("available")} disabled={busy} className="btn-secondary text-sm">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />} Aktifkan lagi
          </button>
        )}
        <button onClick={remove} disabled={busy} className="btn-secondary text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
          <Trash2 className="h-4 w-4" /> Hapus iklan
        </button>
      </div>
      {err && <p className="mt-2 text-xs text-red-600">{err}</p>}
    </div>
  );
}
