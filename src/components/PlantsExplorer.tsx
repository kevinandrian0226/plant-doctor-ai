"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, SlidersHorizontal, Leaf, Clock } from "lucide-react";
import { HealthBadge } from "./HealthBadge";
import { RiskBadge } from "./RiskBadge";
import { formatDateShort, cn } from "@/lib/utils";

export interface PlantListItem {
  id: string;
  name: string;
  species: string | null;
  scientific: string | null;
  category: string | null;
  cover: string | null;
  status: string;
  risk: string | null;
  updated_at: string;
  diagnosis_count: number;
}

const HEALTH_OPTIONS = [
  { value: "", label: "Semua kesehatan" },
  { value: "healthy", label: "Sehat" },
  { value: "mild", label: "Gejala Ringan" },
  { value: "serious", label: "Serius" },
  { value: "critical", label: "Kritis" },
];
const RISK_OPTIONS = [
  { value: "", label: "Semua risiko" },
  { value: "low", label: "Rendah" },
  { value: "medium", label: "Sedang" },
  { value: "high", label: "Tinggi" },
  { value: "emergency", label: "Darurat" },
];

export function PlantsExplorer({ plants }: { plants: PlantListItem[] }) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [health, setHealth] = useState("");
  const [risk, setRisk] = useState("");

  const categories = useMemo(() => {
    const set = new Set<string>();
    plants.forEach((p) => p.category && set.add(p.category));
    return Array.from(set).sort();
  }, [plants]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return plants.filter((p) => {
      if (needle) {
        const hay = `${p.name} ${p.species ?? ""} ${p.scientific ?? ""}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      if (category && p.category !== category) return false;
      if (health && p.status !== health) return false;
      if (risk && p.risk !== risk) return false;
      return true;
    });
  }, [plants, q, category, health, risk]);

  const selectCls =
    "rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-leaf-400 dark:border-gray-700 dark:bg-gray-900";

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari nama atau spesies..."
          className="input pl-10"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
          <SlidersHorizontal className="h-3.5 w-3.5" /> Filter
        </span>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectCls}>
          <option value="">Semua kategori</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select value={health} onChange={(e) => setHealth(e.target.value)} className={selectCls}>
          {HEALTH_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select value={risk} onChange={(e) => setRisk(e.target.value)} className={selectCls}>
          {RISK_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {(q || category || health || risk) && (
          <button
            onClick={() => {
              setQ("");
              setCategory("");
              setHealth("");
              setRisk("");
            }}
            className="text-xs font-semibold text-leaf-600 hover:underline"
          >
            Reset
          </button>
        )}
      </div>

      <p className="text-xs text-gray-400">
        Menampilkan {filtered.length} dari {plants.length} tanaman
      </p>

      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 py-12 text-center text-sm text-gray-500">
          <Leaf className="h-7 w-7 text-leaf-400" />
          Tidak ada tanaman yang cocok dengan filter.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((p) => (
            <Link
              key={p.id}
              href={`/plants/${p.id}`}
              className="group card flex gap-4 transition hover:shadow-soft"
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-leaf-50 dark:bg-leaf-900/30">
                {p.cover ? (
                  <Image
                    src={p.cover}
                    alt={p.name}
                    fill
                    className="object-cover transition group-hover:scale-105"
                    sizes="80px"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center text-leaf-400">
                    <Leaf className="h-7 w-7" />
                  </span>
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate font-semibold">{p.name}</p>
                    <HealthBadge status={p.status} />
                  </div>
                  {p.species && p.species !== p.name && (
                    <p className="truncate text-xs text-gray-500">{p.species}</p>
                  )}
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    {p.category && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-gray-800">
                        {p.category}
                      </span>
                    )}
                    {p.risk && <RiskBadge level={p.risk} />}
                  </div>
                </div>
                <div className="mt-1 flex items-center gap-3 text-[11px] text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {formatDateShort(p.updated_at)}
                  </span>
                  {p.diagnosis_count > 0 && <span>{p.diagnosis_count}× diagnosa</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
