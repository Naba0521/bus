"use client";

import { useState, useEffect } from "react";
import { StopSearch, type BusStop } from "@/components/StopSearch";
import { ArrivalList } from "@/components/ArrivalList";
import { BusMap } from "@/components/BusMap";
import { OfflineBanner } from "@/components/OfflineBanner";

export default function Home() {
  const [selected, setSelected] = useState<BusStop | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [selectedRouteNo, setSelectedRouteNo] = useState<string>("");

  useEffect(() => {
    setSelectedRouteId(null);
    setSelectedRouteNo("");
  }, [selected?.busstop_id]);

  const handleSelectRoute = (
    routeId: string | null,
    routeNo?: string
  ) => {
    setSelectedRouteId(routeId);
    setSelectedRouteNo(routeNo ?? "");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <OfflineBanner />
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-xl px-4 py-4">
          <h1 className="text-xl font-bold text-slate-800">
            УБ Автобус – Ирэх цаг
          </h1>
          <p className="text-sm text-slate-500">
            Зогсоол сонгож, маршрут дарж автобусны байршлыг харна уу
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 py-6">
        <div className="mb-6">
          <StopSearch onSelect={setSelected} selected={selected} />
        </div>
        {selected && (
          <div className="mb-6">
            <BusMap
              stop={selected}
              selectedRouteId={selectedRouteId}
              selectedRouteNo={selectedRouteNo}
            />
          </div>
        )}
        <ArrivalList
          stop={selected}
          selectedRouteId={selectedRouteId}
          onSelectRoute={handleSelectRoute}
        />
      </main>
    </div>
  );
}
