import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { HealthScore } from "./HealthScore";

/** Perbandingan kondisi sebelum vs sesudah (recovery tracker) */
export function BeforeAfter({
  beforeUrl,
  afterUrl,
  beforeScore,
  afterScore,
  beforeLabel = "Sebelumnya",
  afterLabel = "Sekarang",
}: {
  beforeUrl?: string | null;
  afterUrl?: string | null;
  beforeScore?: number;
  afterScore?: number;
  beforeLabel?: string;
  afterLabel?: string;
}) {
  return (
    <div className="card-tight">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
        <Frame url={beforeUrl} score={beforeScore} label={beforeLabel} muted />
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-100 text-leaf-600 dark:bg-white/5">
          <ArrowRight className="h-4 w-4" />
        </span>
        <Frame url={afterUrl} score={afterScore} label={afterLabel} />
      </div>
    </div>
  );
}

function Frame({
  url,
  score,
  label,
  muted,
}: {
  url?: string | null;
  score?: number;
  label: string;
  muted?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-muted">{label}</p>
      <div
        className={
          "relative aspect-square w-full overflow-hidden rounded-2xl bg-sage-100 dark:bg-white/5 " +
          (muted ? "opacity-90" : "ring-2 ring-leaf-200 dark:ring-leaf-800")
        }
      >
        {url ? (
          <Image src={url} alt={label} fill className="object-cover" sizes="200px" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-charcoal-muted">
            Tidak ada foto
          </div>
        )}
      </div>
      {typeof score === "number" && <HealthScore score={score} size={56} />}
    </div>
  );
}
