"use client";

import { MapPin, Navigation } from "lucide-react";
import type { GpsLatest } from "@/lib/api";

interface GpsCardProps {
  data: GpsLatest | null;
}

export function GpsCard({ data }: GpsCardProps) {
  return (
    <div className="rounded-2xl bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2 pb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Navigation className="h-4 w-4 text-primary" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">Data GPS</h3>
      </div>

      {data ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-secondary p-3">
            <p className="text-xs text-muted-foreground">Latitude</p>
            <p className="text-sm font-semibold text-foreground tabular-nums">{data.lat.toFixed(6)}</p>
          </div>
          <div className="rounded-xl bg-secondary p-3">
            <p className="text-xs text-muted-foreground">Longitude</p>
            <p className="text-sm font-semibold text-foreground tabular-nums">{data.lng.toFixed(6)}</p>
          </div>
          <div className="rounded-xl bg-secondary p-3">
            <p className="text-xs text-muted-foreground">Akurasi</p>
            <p className="text-sm font-semibold text-foreground tabular-nums">{data.accuracy_m}m</p>
          </div>
          <div className="rounded-xl bg-secondary p-3">
            <p className="text-xs text-muted-foreground">Timestamp</p>
            <p className="text-xs font-medium text-foreground">
              {new Date(data.ts).toLocaleTimeString("id-ID")}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-xl bg-secondary p-4">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Belum ada data GPS</p>
        </div>
      )}
    </div>
  );
}
