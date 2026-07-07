import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { createClient } from "@/lib/supabase/server";
import { uploadToPath } from "@/lib/storage";

export const runtime = "nodejs";

/**
 * GET /api/plants/[id]/qrcode -> generate (atau ambil) QR code untuk tanaman.
 * QR mengarah ke halaman detail tanaman; gambar PNG disimpan ke storage.
 * -> { qr_code_url, target_url }
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });

  const { data: plant } = await supabase
    .from("plants")
    .select("id, qr_code_url")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();
  if (!plant) return NextResponse.json({ error: "Tanaman tidak ditemukan." }, { status: 404 });

  const origin = new URL(request.url).origin;
  const base = process.env.NEXT_PUBLIC_SITE_URL || origin;
  const targetUrl = `${base}/plants/${params.id}`;

  // Sudah ada -> kembalikan (kecuali ?refresh=1)
  const refresh = new URL(request.url).searchParams.get("refresh") === "1";
  if (plant.qr_code_url && !refresh) {
    return NextResponse.json({ qr_code_url: plant.qr_code_url, target_url: targetUrl });
  }

  let pngBuffer: Buffer;
  try {
    pngBuffer = await QRCode.toBuffer(targetUrl, {
      width: 512,
      margin: 2,
      color: { dark: "#1d4526", light: "#ffffff" },
    });
  } catch {
    return NextResponse.json({ error: "Gagal membuat QR code." }, { status: 500 });
  }

  let qrUrl: string;
  try {
    qrUrl = await uploadToPath(`${user.id}/qr/${params.id}.png`, pngBuffer, "image/png", true);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal menyimpan QR.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  await supabase
    .from("plants")
    .update({ qr_code_url: qrUrl })
    .eq("id", params.id)
    .eq("user_id", user.id);

  return NextResponse.json({ qr_code_url: qrUrl, target_url: targetUrl });
}
