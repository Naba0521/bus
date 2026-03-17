"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { type BusStopWithCoords, type BusLocation } from "./BusMap";

const UB_CENTER: [number, number] = [47.9212, 106.9057];

function getStopCoords(stop: BusStopWithCoords | null): [number, number] | null {
  if (!stop) return null;
  const s = stop as Record<string, unknown>;
  const lat =
    Number(s.gps_coordy) ||
    Number(s.busstop_gps_y) ||
    Number(s.gps_y) ||
    Number(s.lat) ||
    Number(s.busstop_lat) ||
    Number(s.latitude);
  const lng =
    Number(s.gps_coordx) ||
    Number(s.busstop_gps_x) ||
    Number(s.gps_x) ||
    Number(s.lng) ||
    Number(s.busstop_lng) ||
    Number(s.longitude);
  if (lat && lng && !Number.isNaN(lat) && !Number.isNaN(lng)) return [lat, lng];
  return null;
}

const STOP_ICON = L.divIcon({
  html: '<div style="background:#2563eb;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>',
  className: "",
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const BUS_ICON = L.divIcon({
  html: '<div style="background:#16a34a;width:16px;height:16px;border-radius:4px;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);transform:rotate(-45deg)"></div>',
  className: "",
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

type Props = {
  stop: BusStopWithCoords | null;
  busLocations: BusLocation[];
};

export default function BusMapInner({ stop, busLocations }: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stopMarkerRef = useRef<L.Marker | null>(null);
  const busMarkersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return;

    const map = L.map(containerRef.current).setView(UB_CENTER, 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (stopMarkerRef.current) {
      map.removeLayer(stopMarkerRef.current);
      stopMarkerRef.current = null;
    }
    const coords = getStopCoords(stop);
    if (coords) {
      const marker = L.marker(coords, { icon: STOP_ICON }).addTo(map);
      stopMarkerRef.current = marker;
    }
  }, [stop]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    busMarkersRef.current.forEach((m) => map.removeLayer(m));
    busMarkersRef.current = [];

    busLocations.forEach((bus) => {
      const lat = Number(bus.gps_coordy);
      const lng = Number(bus.gps_coordx);
      if (Number.isNaN(lat) || Number.isNaN(lng)) return;
      const marker = L.marker([lat, lng], {
        icon: BUS_ICON,
      }).addTo(map);
      const title =
        bus.veh_no || bus.bus_id?.slice(-4) || "";
      if (title) marker.bindTooltip(`№${title}`, { offset: [0, -8] });
      busMarkersRef.current.push(marker);
    });

    const stopCoords = getStopCoords(stop);
    const busPoints: [number, number][] = busLocations
      .filter((b) => b.gps_coordx != null && b.gps_coordy != null)
      .map((b) => [b.gps_coordy, b.gps_coordx] as [number, number]);
    const allPoints = stopCoords
      ? [...busPoints, stopCoords]
      : busPoints;
    if (allPoints.length > 0) {
      const bounds = L.latLngBounds(allPoints);
      map.fitBounds(bounds, { padding: [24, 24], maxZoom: 16 });
    } else if (stopCoords) {
      map.setView(stopCoords, 15);
    }
  }, [stop, busLocations]);

  return (
    <div
      ref={containerRef}
      className="h-48 w-full rounded-xl border border-zinc-200 sm:h-56"
    />
  );
}
