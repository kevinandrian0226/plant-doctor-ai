import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });

  const b = await request.json().catch(() => null);
  let handle: string | null = typeof b?.handle === "string" ? b.handle.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 30) : null;
  if (handle === "") handle = null;
  const bio = typeof b?.bio === "string" ? b.bio.slice(0, 280) : null;
  const isPublic = Boolean(b?.is_public);
  if (isPublic && !handle) return NextResponse.json({ error: "Isi username dulu untuk membuat profil publik." }, { status: 400 });

  const { error } = await supabase.from("users").update({ handle, bio, is_public: isPublic }).eq("id", user.id);
  if (error) {
    const msg = /duplicate|unique/i.test(error.message) ? "Username sudah dipakai, coba yang lain." : error.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  return NextResponse.json({ handle, is_public: isPublic });
}
