"use client";

import { useState, useEffect, useCallback } from "react";
import { type BusStop } from "./StopSearch";

export type ArrivalItem = {
  busroute_id: string;
  busroute_no: string;
  bus_id: string;
  travle_time: string;
  stop_time: string;
  busstop_cnt: string;
};

type Props = {
  stop: BusStop | null;
  selectedRouteId: string | null;
  onSelectRoute: (routeId: string | null, routeNo?: string) => void;
};

function getArrvMin(item: ArrivalItem): number {
  const ttime = Number(item.travle_time) || 0;
  const stime = Number(item.stop_time) || 0;
  return Math.floor((ttime + stime) / 60);
}

function getArrivalColor(arrvMin: number): string {
  if (arrvMin <= 3) return "text-emerald-600 font-semibold";
  if (arrvMin <= 7) return "text-amber-600 font-medium";
  return "text-zinc-700";
}

const ROUTE_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
];

export function ArrivalList({ stop, selectedRouteId, onSelectRoute }: Props) {
  const [list, setList] = useState<ArrivalItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchArrivals = useCallback(async () => {
    if (!stop) return;
    setLoading(true);
    setError(null);
    const now = new Date();
    const yyyymm =
      now.getFullYear() + String(now.getMonth() + 1).padStart(2, "0");
    const today =
      now.getFullYear() +
      String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getDate()).padStart(2, "0");

    try {
      const res = await fetch(
        `/api/arrival?busstop_id=${encodeURIComponent(stop.busstop_id)}&yyyymm=${yyyymm}&today=${today}`
      );
      const data = await res.json();
      if (data.result_code === "001" && data.list) {
        const sorted = [...data.list].sort(
          (a: ArrivalItem, b: ArrivalItem) => getArrvMin(a) - getArrvMin(b)
        );
        setList(sorted);
        setLastRefresh(new Date());
      } else {
        setList([]);
        setError(data.result_code === "002" ? "Ойрхон ирэх автобус олдсонгүй" : "Өгөгдөл татахад алдаа гарлаа");
      }
    } catch {
      setError("Сүлжээнд холбогдох боломжгүй байна. Интернэт холболтоо шалгана уу.");
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [stop]);

  useEffect(() => {
    if (!stop) {
      setList([]);
      return;
    }
    fetchArrivals();
  }, [stop, fetchArrivals]);

  useEffect(() => {
    if (!stop || list.length === 0) return;
    const t = setInterval(fetchArrivals, 30000);
    return () => clearInterval(t);
  }, [stop, list.length, fetchArrivals]);

  if (!stop) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-8 text-center text-zinc-500">
        Зогсоол сонгоно уу
      </div>
    );
  }

  if (loading && list.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        <p className="mt-2 text-zinc-600">Ирэх автобусууд ачаалж байна...</p>
      </div>
    );
  }

  if (error && list.length === 0) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
        <p className="font-medium text-amber-800">{error}</p>
        <button
          onClick={fetchArrivals}
          className="mt-3 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
        >
          Дахин оролдох
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white">
      <div className="border-b border-zinc-100 px-4 py-3">
        <p className="mb-1 text-xs text-zinc-500">
          Маршрут дарж газрын зураг дээр автобусны байршлыг харна уу
        </p>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-zinc-800">
          {stop.busstop_nmmn}{" "}
          <span className="font-normal text-zinc-500">({stop.busstop_id})</span>
        </h3>
        <div className="flex items-center gap-2">
          {lastRefresh && (
            <span className="text-xs text-zinc-400">
              {lastRefresh.toLocaleTimeString("mn-MN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
          <button
            onClick={fetchArrivals}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "..." : "Шинэчлэх"}
          </button>
        </div>
        </div>
      </div>
      <ul className="divide-y divide-zinc-100">
        {list.length === 0 ? (
          <li className="px-4 py-6 text-center text-zinc-500">
            Ойрхон ирэх автобус байхгүй
          </li>
        ) : (
          list.map((item, idx) => {
            const arrvMin = getArrvMin(item);
            const busNum =
              item.bus_id && item.bus_id.length >= 10
                ? item.bus_id.substring(4, 6) + "-" + item.bus_id.substring(6)
                : item.bus_id || "-";
            const colorClass = ROUTE_COLORS[idx % ROUTE_COLORS.length];

            const isSelected = selectedRouteId === item.busroute_id;
            return (
              <li
                key={`${item.busroute_id}-${item.bus_id || idx}`}
                role="button"
                tabIndex={0}
                onClick={() =>
                  onSelectRoute(
                    isSelected ? null : item.busroute_id,
                    isSelected ? undefined : item.busroute_no
                  )
                }
                className={`flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50 ${
                  isSelected ? "bg-blue-50 ring-1 ring-blue-200" : ""
                }`}
              >
                <span
                  className={`flex min-w-[3rem] shrink-0 items-center justify-center rounded-lg px-2 py-1.5 text-sm font-bold text-white ${colorClass}`}
                >
                  {item.busroute_no}
                </span>
                <div className="min-w-0 flex-1">
                  <span className="font-medium text-zinc-800">
                    {item.busroute_no}
                  </span>
                  <span className="ml-2 text-sm text-zinc-500">
                    {busNum && `№${busNum} · `}{item.busstop_cnt} зогсоол
                  </span>
                </div>
                <span className={`shrink-0 ${getArrivalColor(arrvMin)}`}>
                  {arrvMin} мин
                </span>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
