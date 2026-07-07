"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

export function DeletePlantButton({ plantId }: { plantId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);

  async function remove() {
    setLoading(true);
    const res = await fetch(`/api/plants/${plantId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/plants");
      router.refresh();
    } else {
      setLoading(false);
      setConfirm(false);
    }
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={remove}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          Hapus permanen
        </button>
        <button
          onClick={() => setConfirm(false)}
          disabled={loading}
          className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Batal
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="flex items-center gap-1.5 rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
      title="Hapus tanaman"
    >
      <Trash2 className="h-5 w-5" />
    </button>
  );
}
