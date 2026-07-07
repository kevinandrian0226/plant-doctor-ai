import { createAdminClient } from "./supabase/server";

const BUCKET = process.env.NEXT_PUBLIC_STORAGE_BUCKET || "plant-photos";

// Upload satu file gambar ke path acak, kembalikan public URL.
export async function uploadPhoto(
  userId: string,
  buffer: Buffer,
  mime: string
): Promise<string> {
  const ext = mime.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  return uploadToPath(path, buffer, mime);
}

// Upload ke path tertentu (mis. QR code), opsi upsert.
export async function uploadToPath(
  path: string,
  buffer: Buffer,
  mime: string,
  upsert = false
): Promise<string> {
  const admin = createAdminClient();
  const { error } = await admin.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: mime, upsert });
  if (error) throw new Error(`Gagal mengunggah: ${error.message}`);
  const {
    data: { publicUrl },
  } = admin.storage.from(BUCKET).getPublicUrl(path);
  return publicUrl;
}

export async function fileToBuffer(file: File): Promise<Buffer> {
  return Buffer.from(await file.arrayBuffer());
}
