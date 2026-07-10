import { notFound } from "next/navigation";
import { MessageCircle, Mail, Clock, Sprout, Inbox } from "lucide-react";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type ConsultRow = {
  id: string;
  plant_id: string | null;
  name: string | null;
  contact: string | null;
  topic: string | null;
  message: string;
  status: string | null;
  created_at: string;
};

function contactHref(contact: string) {
  const c = contact.trim();
  if (c.includes("@")) return `mailto:${c}`;
  const digits = c.replace(/\D/g, "");
  if (digits.length >= 8) {
    const intl = digits.startsWith("0") ? "62" + digits.slice(1) : digits.startsWith("62") ? digits : "62" + digits;
    return `https://wa.me/${intl}`;
  }
  return null;
}

export default async function AdminKonsultasiPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const adminEmail = process.env.ADMIN_EMAIL || "";
  // Hanya pemilik (email admin) yang boleh melihat inbox ini.
  if (!user || !adminEmail || user.email?.toLowerCase() !== adminEmail.toLowerCase()) notFound();

  const admin = createAdminClient();
  const { data } = await admin
    .from("consult_requests").select("*").order("created_at", { ascending: false }).limit(200);
  const rows = (data || []) as ConsultRow[];
  const newCount = rows.filter((r) => (r.status || "new") === "new").length;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="display-title text-3xl">Inbox Konsultasi</h1>
          <p className="mt-1 text-sm text-charcoal-muted">Permintaan konsultasi ahli yang masuk dari pengguna.</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-leaf-100 px-3 py-1 text-sm font-semibold text-leaf-700 dark:bg-leaf-900/40 dark:text-leaf-200">
          <Inbox className="h-4 w-4" /> {newCount} baru
        </span>
      </div>

      {rows.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-3xl bg-sage-100 text-charcoal-muted dark:bg-white/5"><Inbox className="h-7 w-7" /></span>
          <p className="font-semibold">Belum ada permintaan</p>
          <p className="max-w-xs text-sm text-charcoal-muted">Permintaan konsultasi dari pengguna akan muncul di sini.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => {
            const href = r.contact ? contactHref(r.contact) : null;
            return (
              <div key={r.id} className="card-lux">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-sheen px-3 py-0.5 text-xs font-bold text-leaf-950">{r.topic || "Umum"}</span>
                  <span className="flex items-center gap-1 text-xs text-charcoal-muted"><Clock className="h-3.5 w-3.5" /> {formatDate(r.created_at)}</span>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-charcoal dark:text-sage-50">{r.message}</p>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                  {r.contact && (
                    href ? (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-medium text-leaf-700 hover:underline dark:text-leaf-300">
                        {r.contact.includes("@") ? <Mail className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />} {r.contact}
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-charcoal-muted"><MessageCircle className="h-4 w-4" /> {r.contact}</span>
                    )
                  )}
                  {r.plant_id && <span className="inline-flex items-center gap-1 text-xs text-charcoal-muted"><Sprout className="h-3.5 w-3.5" /> terkait tanaman</span>}
                  {(r.status || "new") === "new" && <span className="rounded-full bg-leaf-100 px-2 py-0.5 text-[11px] font-semibold text-leaf-700 dark:bg-leaf-900/40 dark:text-leaf-200">Baru</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
