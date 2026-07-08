"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Check, AtSign, ExternalLink } from "lucide-react";

export function ProfileSettings({ initial }: { initial: { handle: string; bio: string; is_public: boolean } }) {
  const [handle, setHandle] = useState(initial.handle);
  const [bio, setBio] = useState(initial.bio);
  const [isPublic, setIsPublic] = useState(initial.is_public);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null); setSaved(false);
    try {
      const res = await fetch("/api/profile", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle, bio, is_public: isPublic }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error);
      setHandle(data.handle || "");
      setSaved(true);
    } catch (e) { setError(e instanceof Error ? e.message : "Gagal menyimpan."); }
    finally { setBusy(false); }
  };

  return (
    <form onSubmit={save} className="card space-y-4">
      <div>
        <label className="label">Username publik</label>
        <div className="relative">
          <AtSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input value={handle} onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))} placeholder="namakolektor" className="input pl-10" />
        </div>
        {handle && <p className="mt-1 text-xs text-charcoal-muted">Profilmu: /u/{handle}</p>}
      </div>
      <div><label className="label">Bio</label><textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="Kolektor aroid & monstera langka..." className="input" /></div>
      <div className="flex items-center justify-between">
        <div><p className="text-sm font-semibold">Profil publik</p><p className="text-xs text-charcoal-muted">Bisa ditemukan & diikuti kolektor lain</p></div>
        <button type="button" onClick={() => setIsPublic(!isPublic)} className={`relative h-7 w-12 shrink-0 rounded-full transition ${isPublic ? "bg-leaf-600" : "bg-sage-300 dark:bg-white/15"}`}>
          <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${isPublic ? "left-6" : "left-1"}`} />
        </button>
      </div>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-300">{error}</p>}
      <div className="flex items-center gap-2">
        <button type="submit" disabled={busy} className="btn-primary">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : null}{saved ? "Tersimpan" : "Simpan profil"}</button>
        {isPublic && handle && <Link href={`/u/${handle}`} target="_blank" className="btn-secondary"><ExternalLink className="h-4 w-4" /> Lihat profil</Link>}
      </div>
    </form>
  );
}
