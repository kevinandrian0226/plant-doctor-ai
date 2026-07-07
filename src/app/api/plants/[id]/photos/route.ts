import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { uploadPhoto, fileToBuffer } from "@/lib/storage";
import type { DbPhotoType } from "@/lib/db-types";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 8 * 1024 * 1024;
const VALID: DbPhotoType[] = ["whole_plant", "leaf", "stem", "root", "soil", "other"];

/**
 * POST /api/plants/[id]/photos -> upload foto follow-up
 * FormData: photo (File), photo_type?, scan_id?
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });

  // Pastikan tanaman milik user
  const { data: plant } = await supabase
    .from("plants")
    .select("id")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();
  if (!plant) return NextResponse.json({ error: "Tanaman tidak ditemukan." }, { status: 404 });

  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Request tidak valid." }, { status: 400 });

  const file = form.get("photo");
  const rawType = String(form.get("photo_type") || "other") as DbPhotoType;
  const photo_type = VALID.includes(rawType) ? rawType : "other";
  const scanId = String(form.get("scan_id") || "").trim() || null;

  if (!(file instanceof File) || file.size === 0)
    return NextResponse.json({ error: "Foto wajib diunggah." }, { status: 400 });
  if (file.size > MAX_BYTES)
    return NextResponse.json({ error: "Foto maksimal 8 MB." }, { status: 400 });
  if (!file.type.startsWith("image/"))
    return NextResponse.json({ error: "File harus berupa gambar." }, { status: 400 });

  let url: string;
  try {
    url = await uploadPhoto(user.id, await fileToBuffer(file), file.type);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal mengunggah foto.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("plant_photos")
    .insert({ plant_id: params.id, scan_id: scanId, photo_url: url, photo_type })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ photo: data }, { status: 201 });
}
