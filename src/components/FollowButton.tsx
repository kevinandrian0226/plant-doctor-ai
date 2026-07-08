"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function FollowButton({ targetId, initialFollowing, canFollow }: { targetId: string; initialFollowing: boolean; canFollow: boolean }) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const toggle = async () => {
    if (busy) return;
    if (!canFollow) { window.location.href = "/login?redirect=" + encodeURIComponent(window.location.pathname); return; }
    setBusy(true); setError(false);
    const prev = following;
    setFollowing(!following);
    try {
      const res = await fetch(`/api/follow/${targetId}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error();
      setFollowing(data.following);
      router.refresh();
    } catch { setFollowing(prev); setError(true); } finally { setBusy(false); }
  };
  return (
    <div className="flex flex-col items-center gap-1 sm:items-end">
      <button onClick={toggle} disabled={busy} className={cn("inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition active:scale-95 disabled:opacity-60",
        following ? "border border-sage-200 bg-white text-charcoal-light dark:border-white/10 dark:bg-white/5 dark:text-sage-200" : "bg-leaf-700 text-white hover:bg-leaf-800")}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : following ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
        {following ? "Mengikuti" : "Ikuti"}
      </button>
      {error && <span className="text-[11px] text-red-600">Gagal, coba lagi.</span>}
    </div>
  );
}
