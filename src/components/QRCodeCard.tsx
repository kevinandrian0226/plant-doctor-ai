"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { QrCode, Download, Printer, Copy, Check } from "lucide-react";

export function QRCodeCard({ plantId, plantName }: { plantId: string; plantName: string }) {
  const [dataUrl, setDataUrl] = useState("");
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== "undefined" ? window.location.origin : "");
    const target = `${base}/plants/${plantId}`;
    setUrl(target);
    QRCode.toDataURL(target, { width: 480, margin: 2, color: { dark: "#1d4526", light: "#ffffff" } }).then(setDataUrl).catch(() => setDataUrl(""));
  }, [plantId]);

  function download() {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl; a.download = `qr-${plantName.replace(/\s+/g, "-").toLowerCase()}.png`; a.click();
  }
  function printQR() {
    if (!dataUrl) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>QR ${plantName}</title><style>body{font-family:sans-serif;text-align:center;padding:40px}img{width:300px;height:300px}h2{margin:16px 0 4px}p{color:#666;font-size:12px}</style></head><body><img src="${dataUrl}"/><h2>${plantName}</h2><p>Scan untuk lihat detail tanaman</p></body></html>`);
    w.document.close(); w.focus(); setTimeout(() => w.print(), 300);
  }
  async function copyLink() { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1500); }

  return (
    <div className="card mx-auto max-w-sm text-center">
      <h3 className="mb-1 flex items-center justify-center gap-2 text-sm font-semibold text-charcoal-muted"><QrCode className="h-4 w-4" /> QR Code Tanaman</h3>
      <p className="mb-4 text-xs text-charcoal-muted">Tempel pada pot — scan untuk buka halaman tanaman ini.</p>
      <div className="mx-auto mb-4 flex h-56 w-56 items-center justify-center rounded-2xl bg-white p-3 shadow-card">
        {dataUrl ? <img src={dataUrl} alt="QR code" className="h-full w-full" /> : <span className="text-xs text-charcoal-muted">Membuat QR...</span>}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <button onClick={download} className="btn-secondary px-4 py-2 text-xs"><Download className="h-3.5 w-3.5" /> Unduh</button>
        <button onClick={printQR} className="btn-secondary px-4 py-2 text-xs"><Printer className="h-3.5 w-3.5" /> Cetak</button>
        <button onClick={copyLink} className="btn-secondary px-4 py-2 text-xs">{copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}{copied ? "Tersalin" : "Salin Link"}</button>
      </div>
    </div>
  );
}
