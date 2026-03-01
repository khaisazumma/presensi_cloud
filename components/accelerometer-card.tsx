"use client";

import { Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import type { AccelLatest } from "@/lib/api";

interface AccelSample {
  t: string;
  x: number;
  y: number;
  z: number;
}

interface AccelerometerCardProps {
  latest: AccelLatest | null;
  samples: AccelSample[];
}

export function AccelerometerCard({ latest, samples }: AccelerometerCardProps) {
  const chartData = samples.slice(-30).map((s, i) => ({
    idx: i,
    x: Number(s.x.toFixed(2)),
    y: Number(s.y.toFixed(2)),
    z: Number(s.z.toFixed(2)),
  }));

  return (
    <div className="rounded-2xl bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2 pb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20">
          <Activity className="h-4 w-4 text-accent-foreground" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">Sensor Accelerometer</h3>
      </div>

      {/* Live values */}
      <div className="grid grid-cols-3 gap-3 pb-4">
        <div className="rounded-xl bg-chart-1/10 p-3 text-center">
          <p className="text-xs text-muted-foreground">X</p>
          <p className="text-lg font-bold tabular-nums text-chart-1">
            {latest ? latest.x.toFixed(2) : "---"}
          </p>
        </div>
        <div className="rounded-xl bg-chart-2/10 p-3 text-center">
          <p className="text-xs text-muted-foreground">Y</p>
          <p className="text-lg font-bold tabular-nums text-chart-2">
            {latest ? latest.y.toFixed(2) : "---"}
          </p>
        </div>
        <div className="rounded-xl bg-chart-3/10 p-3 text-center">
          <p className="text-xs text-muted-foreground">Z</p>
          <p className="text-lg font-bold tabular-nums text-chart-3">
            {latest ? latest.z.toFixed(2) : "---"}
          </p>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 ? (
        <div className="h-[160px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="idx" tick={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} width={35} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Line type="monotone" dataKey="x" stroke="var(--color-chart-1)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="y" stroke="var(--color-chart-2)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="z" stroke="var(--color-chart-3)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Belum ada data accelerometer
        </p>
      )}
    </div>
  );
}
