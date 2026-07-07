"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  User,
  Languages,
  Palette,
  Download,
  LogOut,
  Loader2,
  Check,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { updateProfileName, logout, type AuthState } from "@/app/(auth)/actions";
import { cn } from "@/lib/utils";

function SaveBtn() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
      Simpan
    </button>
  );
}

export function SettingsClient({
  email,
  fullName,
}: {
  email: string;
  fullName: string;
}) {
  const { theme, toggle } = useTheme();
  const [state, action] = useFormState<AuthState, FormData>(updateProfileName, {});
  const [lang, setLang] = useState("id");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("pdai_lang") : null;
    if (saved) setLang(saved);
  }, []);

  function changeLang(v: string) {
    setLang(v);
    if (typeof window !== "undefined") window.localStorage.setItem("pdai_lang", v);
  }

  async function exportData() {
    setExporting(true);
    try {
      const res = await fetch("/api/export");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `plant-doctor-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Profil */}
      <Section icon={User} title="Profil">
        <form action={action} className="space-y-3">
          <div>
            <label className="label" htmlFor="full_name">
              Nama
            </label>
            <input
              id="full_name"
              name="full_name"
              defaultValue={fullName}
              placeholder="Nama kamu"
              className="input"
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input value={email} disabled className="input opacity-60" />
          </div>
          {state.message && (
            <p className="text-sm text-leaf-600">{state.message}</p>
          )}
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          <SaveBtn />
        </form>
      </Section>

      {/* Bahasa */}
      <Section icon={Languages} title="Bahasa">
        <p className="mb-2 text-xs text-gray-400">
          Preferensi bahasa disimpan. Saat ini antarmuka tersedia dalam Bahasa Indonesia.
        </p>
        <div className="grid grid-cols-2 gap-2 sm:max-w-xs">
          {[
            { v: "id", label: "🇮🇩 Indonesia" },
            { v: "en", label: "🇬🇧 English" },
          ].map((o) => (
            <button
              key={o.v}
              onClick={() => changeLang(o.v)}
              className={cn(
                "rounded-xl border p-2.5 text-sm font-medium transition",
                lang === o.v
                  ? "border-leaf-500 bg-leaf-50 dark:bg-leaf-900/30"
                  : "border-gray-200 dark:border-gray-700"
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      </Section>

      {/* Tema */}
      <Section icon={Palette} title="Tema">
        <div className="grid grid-cols-2 gap-2 sm:max-w-xs">
          <button
            onClick={() => theme === "dark" && toggle()}
            className={cn(
              "flex items-center justify-center gap-2 rounded-xl border p-2.5 text-sm font-medium transition",
              theme === "light"
                ? "border-leaf-500 bg-leaf-50 dark:bg-leaf-900/30"
                : "border-gray-200 dark:border-gray-700"
            )}
          >
            <Sun className="h-4 w-4" /> Terang
          </button>
          <button
            onClick={() => theme === "light" && toggle()}
            className={cn(
              "flex items-center justify-center gap-2 rounded-xl border p-2.5 text-sm font-medium transition",
              theme === "dark"
                ? "border-leaf-500 bg-leaf-50 dark:bg-leaf-900/30"
                : "border-gray-200 dark:border-gray-700"
            )}
          >
            <Moon className="h-4 w-4" /> Gelap
          </button>
        </div>
      </Section>

      {/* Data */}
      <Section icon={Download} title="Data">
        <p className="mb-3 text-sm text-gray-500">
          Unduh seluruh datamu (tanaman, diagnosis, jurnal) dalam format JSON.
        </p>
        <button onClick={exportData} disabled={exporting} className="btn-secondary">
          {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Export Data (JSON)
        </button>
      </Section>

      {/* Keluar */}
      <form action={logout}>
        <button
          type="submit"
          className="flex items-center gap-2 rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900/40 dark:hover:bg-red-900/20"
        >
          <LogOut className="h-4 w-4" /> Keluar
        </button>
      </form>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
        <Icon className="h-4 w-4" /> {title}
      </h2>
      {children}
    </section>
  );
}
