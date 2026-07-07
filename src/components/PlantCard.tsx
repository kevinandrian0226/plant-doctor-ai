import Link from "next/link";
import Image from "next/image";
import { Leaf, Clock } from "lucide-react";
import { HealthBadge } from "./HealthBadge";
import { RiskBadge } from "./RiskBadge";
import { formatDateShort } from "@/lib/utils";

export interface PlantCardItem {
  id: string; name: string; species?: string | null; cover?: string | null;
  status?: string; risk?: string | null; updatedAt?: string; count?: number;
}

export function PlantCard({ item }: { item: PlantCardItem }) {
  return (
    <Link href={`/plants/${item.id}`} className="group card flex gap-4 transition hover:shadow-lift">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-sage-100 dark:bg-white/5">
        {item.cover ? (
          <Image src={item.cover} alt={item.name} fill className="object-cover transition group-hover:scale-105" sizes="80px" />
        ) : (
          <div className="flex h-full items-center justify-center text-leaf-400"><Leaf className="h-7 w-7" /></div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <p className="truncate font-semibold text-charcoal dark:text-sage-50">{item.name}</p>
            {item.status && <HealthBadge status={item.status} />}
          </div>
          {item.species && item.species !== item.name && <p className="truncate text-xs text-charcoal-muted">{item.species}</p>}
          {item.risk && <div className="mt-1.5"><RiskBadge level={item.risk} /></div>}
        </div>
        <div className="mt-1 flex items-center gap-3 text-[11px] text-charcoal-muted">
          {item.updatedAt && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDateShort(item.updatedAt)}</span>}
          {typeof item.count === "number" && item.count > 0 && <span>{item.count}× scan</span>}
        </div>
      </div>
    </Link>
  );
}
