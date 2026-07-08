"use client";

import { useRef, useState, useEffect } from "react";
import { Leaf, Send, Loader2, Sparkles } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Bagaimana cara merawatnya minggu ini?",
  "Apakah aman dipindah pot sekarang?",
  "Seberapa sering harus disiram?",
  "Bagaimana mencegah penyakit ini menyebar?",
];

export function PlantChat({ plantId, plantName }: { plantId: string; plantName: string }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || loading) return;
    setError(null);
    const next: Msg[] = [...messages, { role: "user", content: q }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch(`/api/plants/${plantId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Gagal menghubungi Dokter AI.");
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card flex h-[32rem] flex-col overflow-hidden p-0">
      {/* header */}
      <div className="flex items-center gap-3 border-b border-black/5 px-5 py-4 dark:border-white/10">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-leaf-700 text-white shadow-soft ring-1 ring-gold-300/30">
          <Leaf className="h-5 w-5" />
        </span>
        <div>
          <p className="font-semibold leading-tight">Tanya Dokter AI</p>
          <p className="text-xs text-charcoal-muted">Konsultasi perawatan {plantName}</p>
        </div>
      </div>

      {/* messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {messages.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-3xl bg-leaf-50 text-leaf-600 dark:bg-white/5">
              <Sparkles className="h-7 w-7" strokeWidth={1.75} />
            </span>
            <p className="max-w-xs text-sm text-charcoal-muted">
              Tanyakan apa saja soal perawatan tanamanmu. AI menjawab berdasarkan diagnosa terakhir.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-gold-200/60 bg-white px-3 py-1.5 text-xs font-medium text-charcoal-light transition hover:border-gold-300 hover:bg-sage-50 dark:border-gold-700/30 dark:bg-white/5 dark:text-sage-200 dark:hover:bg-white/10"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={
                m.role === "user"
                  ? "max-w-[80%] rounded-2xl rounded-br-md bg-leaf-700 px-4 py-2.5 text-sm text-white"
                  : "max-w-[85%] rounded-2xl rounded-bl-md bg-sage-100 px-4 py-2.5 text-sm text-charcoal dark:bg-white/5 dark:text-sage-50"
              }
            >
              <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-sage-100 px-4 py-3 text-sm text-charcoal-muted dark:bg-white/5">
              <Loader2 className="h-4 w-4 animate-spin" /> Dokter sedang mengetik...
            </div>
          </div>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-600 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </p>
        )}
      </div>

      {/* input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t border-black/5 px-4 py-3 dark:border-white/10"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tulis pertanyaanmu..."
          className="input flex-1"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-leaf-700 text-white shadow-soft transition hover:bg-leaf-800 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
          aria-label="Kirim"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </button>
      </form>
    </div>
  );
}
