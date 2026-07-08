import { Award, Sprout, Camera, Globe, Star } from "lucide-react";

type Counts = { plantCount: number; scanCount: number; publicCount: number };
const BADGES = [
  { key: "starter", label: "Pemula Hijau", desc: "Scan pertama", icon: Camera, need: (c: Counts) => c.scanCount >= 1 },
  { key: "collector", label: "Kolektor", desc: "5+ tanaman", icon: Sprout, need: (c: Counts) => c.plantCount >= 5 },
  { key: "curator", label: "Kurator", desc: "10+ tanaman", icon: Star, need: (c: Counts) => c.plantCount >= 10 },
  { key: "sharer", label: "Berbagi", desc: "Bagikan publik", icon: Globe, need: (c: Counts) => c.publicCount >= 1 },
  { key: "active", label: "Rajin", desc: "5+ scan", icon: Award, need: (c: Counts) => c.scanCount >= 5 },
];

export function Badges({ plantCount, scanCount, publicCount }: Counts) {
  const counts = { plantCount, scanCount, publicCount };
  const level = 1 + Math.floor(plantCount / 3) + Math.floor(scanCount / 4);
  const earnedCount = BADGES.filter((b) => b.need(counts)).length;
  return (
    <div className="card-lux">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold-sheen text-leaf-950 shadow-gold"><Award className="h-6 w-6" /></span>
          <div>
            <p className="display-title text-lg leading-none">Level {level}</p>
            <p className="text-xs text-charcoal-muted">{earnedCount}/{BADGES.length} badge terkumpul</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {BADGES.map((b) => {
          const got = b.need(counts);
          return (
            <div key={b.key} className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center transition ${got ? "border-gold-200 bg-gold-50 dark:border-gold-700/40 dark:bg-gold-900/10" : "border-black/5 bg-sage-50/50 opacity-55 dark:border-white/10 dark:bg-white/5"}`}>
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${got ? "bg-gold-400 text-leaf-950" : "bg-sage-200 text-charcoal-muted dark:bg-white/10"}`}><b.icon className="h-5 w-5" /></span>
              <p className="text-[11px] font-semibold leading-tight">{b.label}</p>
              <p className="text-[10px] leading-tight text-charcoal-muted">{b.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
