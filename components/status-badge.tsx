"use client";

import { CheckCircle, Clock, XCircle } from "lucide-react";

interface StatusBadgeProps {
  status: string | null;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  if (!status) return null;

  const normalized = status.toLowerCase();

  let bgClass = "bg-warning/15 text-warning-foreground";
  let Icon = Clock;
  let label = status;

  if (normalized.includes("success") || normalized.includes("hadir") || normalized.includes("present")) {
    bgClass = "bg-success/15 text-success";
    Icon = CheckCircle;
    label = "Hadir";
  } else if (normalized.includes("fail") || normalized.includes("absent") || normalized.includes("gagal")) {
    bgClass = "bg-destructive/15 text-destructive";
    Icon = XCircle;
    label = "Gagal";
  } else if (normalized.includes("pending") || normalized.includes("waiting")) {
    bgClass = "bg-warning/15 text-accent-foreground";
    Icon = Clock;
    label = "Menunggu";
  }

  return (
    <div className={`flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold ${bgClass}`}>
      <Icon className="h-4 w-4" />
      {label}
    </div>
  );
}
