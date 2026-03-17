"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

export type BusStop = {
  busstop_id: string;
  busstop_nmmn: string;
  busstop_nmus?: string;
} & Record<string, unknown>;

const FAVORITES_KEY = "ub-bus-favorites";

function loadFavorites(): BusStop[] {
  if (typeof window === "undefined") return [];
  try {
    const s = localStorage.getItem(FAVORITES_KEY);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

function saveFavorites(list: BusStop[]) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(list));
  } catch {}
}

type Props = {
  onSelect: (stop: BusStop | null) => void;
  selected: BusStop | null;
};

export function StopSearch({ onSelect, selected }: Props) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [stops, setStops] = useState<BusStop[]>([]);
  const [filtered, setFiltered] = useState<BusStop[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [favorites, setFavorites] = useState<BusStop[]>([]);

  useEffect(() => {
    setFavorites(loadFavorites());
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  const loadStops = useCallback(async () => {
    setLoading(true);
    const now = new Date();
    const yyyymm =
      now.getFullYear() + String(now.getMonth() + 1).padStart(2, "0");
    const today =
      now.getFullYear() +
      String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getDate()).padStart(2, "0");
    try {
      const res = await fetch(
        `/api/bus-stops?yyyymm=${yyyymm}&today=${today}`
      );
      const data = await res.json();
      if (data.result_code === "001" && data.busstop_list) {
        setStops(data.busstop_list);
      }
    } catch {
      // keep silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStops();
  }, [loadStops]);

  const addFavorite = useCallback((stop: BusStop) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.busstop_id === stop.busstop_id);
      if (exists) return prev;
      const next = [stop, ...prev].slice(0, 10);
      saveFavorites(next);
      return next;
    });
  }, []);

  const removeFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.filter((f) => f.busstop_id !== id);
      saveFavorites(next);
      return next;
    });
  }, []);

  const filteredStops = useMemo(() => {
    if (!debouncedQuery.trim()) return stops.slice(0, 50);
    const q = debouncedQuery.toLowerCase();
    return stops.filter(
      (s) =>
        s.busstop_nmmn?.toLowerCase().includes(q) ||
        s.busstop_nmus?.toLowerCase().includes(q) ||
        s.busstop_id?.includes(q)
    );
  }, [debouncedQuery, stops]);

  const displayList = open && !selected ? filteredStops.slice(0, 40) : [];

  return (
    <div className="relative w-full">
      <label className="mb-1 block text-sm font-medium text-zinc-700">
        Зогсоол хайх
      </label>
      <input
        type="text"
        value={selected ? selected.busstop_nmmn : query}
        onChange={(e) => {
          setQuery(e.target.value);
          if (selected) onSelect(null);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 220)}
        placeholder="Зогсоолын нэр эсвэл ID..."
        className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      {loading && (
        <p className="mt-1 text-sm text-zinc-500">Зогсоолууд ачаалж байна...</p>
      )}

      {favorites.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          <span className="text-xs text-zinc-500">Сонголтууд:</span>
          {favorites.map((f) => (
            <button
              key={f.busstop_id}
              type="button"
              onClick={() => onSelect(f)}
              className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700 hover:bg-zinc-200"
            >
              {f.busstop_nmmn}
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="text-sm text-blue-600 hover:underline"
          >
            Өөр зогсоол сонгох
          </button>
          <button
            type="button"
            onClick={() => addFavorite(selected)}
            className="text-sm text-zinc-500 hover:text-zinc-700"
            title="Сонголтод хадгалах"
          >
            ⭐ Хадгалах
          </button>
        </div>
      )}

      {displayList.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-zinc-200 bg-white shadow-lg">
          {displayList.map((s) => (
            <li
              key={s.busstop_id}
              className="flex cursor-pointer items-center justify-between px-4 py-2 text-sm hover:bg-blue-50"
              onMouseDown={() => {
                onSelect(s);
                setQuery("");
                setOpen(false);
              }}
            >
              <span>
                {s.busstop_nmmn}{" "}
                <span className="text-zinc-400">({s.busstop_id})</span>
              </span>
              {favorites.some((f) => f.busstop_id === s.busstop_id) ? (
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    removeFavorite(s.busstop_id);
                  }}
                  className="text-amber-500"
                >
                  ★
                </button>
              ) : (
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    addFavorite(s);
                  }}
                  className="text-zinc-300 hover:text-amber-500"
                >
                  ☆
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
