"use client";

import { useEffect, useRef } from "react";
import type { GpsLatest, GpsHistoryPoint } from "@/lib/api";

interface LocationMapProps {
  latest: GpsLatest | null;
  history: GpsHistoryPoint[];
}

export function LocationMap({ latest, history }: LocationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    async function initMap() {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      // Fix default icon
      delete (L.Icon.Default.prototype as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const center: [number, number] = latest
        ? [latest.lat, latest.lng]
        : [-7.276, 112.792]; // default UNAIR

      const map = L.map(mapContainerRef.current!, {
        center,
        zoom: 16,
        zoomControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OSM",
      }).addTo(map);

      mapRef.current = map;

      if (latest) {
        markerRef.current = L.marker([latest.lat, latest.lng]).addTo(map);
      }
    }

    initMap();

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    async function updateMap() {
      const L = (await import("leaflet")).default;
      const map = mapRef.current!;

      if (latest) {
        if (markerRef.current) {
          markerRef.current.setLatLng([latest.lat, latest.lng]);
        } else {
          markerRef.current = L.marker([latest.lat, latest.lng]).addTo(map);
        }
        map.setView([latest.lat, latest.lng], 16);
      }

      if (history.length > 1) {
        const coords = history.map((p) => [p.lat, p.lng] as [number, number]);
        if (polylineRef.current) {
          polylineRef.current.setLatLngs(coords);
        } else {
          polylineRef.current = L.polyline(coords, {
            color: "#003DA5",
            weight: 3,
            opacity: 0.7,
          }).addTo(map);
        }
      }
    }

    updateMap();
  }, [latest, history]);

  return (
    <div className="overflow-hidden rounded-2xl shadow-sm">
      <div
        ref={mapContainerRef}
        className="h-[240px] w-full bg-secondary"
        style={{ zIndex: 0 }}
      />
    </div>
  );
}
