// Grafik garis sederhana (SVG, tanpa dependency) untuk progress skor kesehatan.
export function ProgressChart({ data }: { data: { score: number }[] }) {
  const w = 600;
  const h = 140;
  const pad = 24;
  const pts = data.map((d) => d.score || 0);
  const n = pts.length;
  if (n === 0) return null;
  const stepX = n > 1 ? (w - pad * 2) / (n - 1) : 0;

  const coords = pts.map((v, i) => {
    const x = pad + i * stepX;
    const y = h - pad - (v / 100) * (h - pad * 2);
    return { x, y, v };
  });

  const path = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(" ");
  const area = `${path} L ${coords[coords.length - 1].x} ${h - pad} L ${coords[0].x} ${h - pad} Z`;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-36 w-full min-w-[320px]">
        <defs>
          <linearGradient id="pdai-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(60,140,69)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="rgb(60,140,69)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 50, 100].map((g) => {
          const y = h - pad - (g / 100) * (h - pad * 2);
          return (
            <g key={g}>
              <line
                x1={pad}
                y1={y}
                x2={w - pad}
                y2={y}
                className="stroke-gray-200 dark:stroke-gray-700"
                strokeDasharray="3 3"
              />
              <text x={4} y={y + 3} className="fill-gray-400 text-[9px]">
                {g}
              </text>
            </g>
          );
        })}
        <path d={area} fill="url(#pdai-grad)" />
        <path d={path} className="fill-none stroke-leaf-500" strokeWidth={2.5} strokeLinejoin="round" />
        {coords.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r={3.5} className="fill-leaf-600" />
        ))}
      </svg>
      <p className="mt-1 text-center text-[11px] text-gray-400">
        Dari diagnosa pertama (kiri) ke terbaru (kanan)
      </p>
    </div>
  );
}
