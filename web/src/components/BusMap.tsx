"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { type BusStop } from "./StopSearch";

const Map = dynamic(() => import("./BusMapInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-48 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50">
      <span className="text-sm text-zinc-500">Газрын зураг ачаалж байна...</span>
    </div>
  ),
});

export type BusStopWithCoords = BusStop & {
  gps_coordx?: number;
  gps_coordy?: number;
  busstop_gps_x?: string;
  busstop_gps_y?: string;
  gps_x?: string;
  gps_y?: string;
  lat?: number;
  lng?: number;
};

export type BusLocation = {
  bus_id: string;
  gps_coordx: number;
  gps_coordy: number;
  busstop_nmmn?: string;
  veh_no?: string;
};

type Props = {
  stop: BusStopWithCoords | null;
  selectedRouteId: string | null;
  selectedRouteNo?: string;
};

export function BusMap({ stop, selectedRouteId, selectedRouteNo }: Props) {
  const [busLocations, setBusLocations] = useState<BusLocation[]>([]);
  const [loadingBuses, setLoadingBuses] = useState(false);

  useEffect(() => {
    if (!selectedRouteId) {
      setBusLocations([]);
      return;
    }
    let cancelled = false;
    setLoadingBuses(true);
    fetch(`/api/bus-locations?busroute_id=${encodeURIComponent(selectedRouteId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.result_code === "001" && Array.isArray(data.list)) {
          setBusLocations(
            data.list.filter(
              (b: BusLocation) =>
                b.gps_coordx != null && b.gps_coordy != null
            )
          );
        } else {
          setBusLocations([]);
        }
      })
      .catch(() => !cancelled && setBusLocations([]))
      .finally(() => !cancelled && setLoadingBuses(false));
    return () => {
      cancelled = true;
    };
  }, [selectedRouteId]);

  return (
    <div>
      {selectedRouteId && selectedRouteNo && (
        <p className="mb-2 text-sm text-zinc-600">
          <span className="font-medium">{selectedRouteNo}</span> маршрутын
          автобусууд ({loadingBuses ? "ачаалж байна..." : `${busLocations.length} ширхэг`})
        </p>
      )}
      <Map stop={stop} busLocations={busLocations} />
    </div>
  );
}
