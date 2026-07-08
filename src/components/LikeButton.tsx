"use client";

import { useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LikeButton({
  plantId,
  initialLiked,
  initialCount,
  canLike = true,
}: {
  plantId: string;
  initialLiked: boolean;
  initialCount: number;
  canLike?: boolean;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    if (busy) return;
    if (!canLike) {
      window.location.href = "/login?redirect=" + encodeURIComponent(window.location.pathname);
      return;
    }
    setBusy(true);
    const prevLiked = liked;
    const prevCount = count;
    setLiked(!liked);
    setCount((c) => c + (liked ? -1 : 1));
    try {
      const res = await fetch(`/api/plants/${plantId}/like`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error);
      setLiked(data.liked);
      setCount(data.count);
    } catch {
      setLiked(prevLiked);
      setCount(prevCount);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition active:scale-95 disabled:opacity-60",
        liked
          ? "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-300"
          : "border-sage-200 bg-white text-charcoal-light hover:border-rose-200 hover:text-rose-600 dark:border-white/10 dark:bg-white/5 dark:text-sage-200"
      )}
      aria-label="Suka"
    >
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart className={cn("h-4 w-4", liked && "fill-current")} />
      )}
      {count}
    </button>
  );
}
