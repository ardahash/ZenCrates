"use client";

import type { PriceSnapshot } from "@/lib/types";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { format } from "date-fns";

interface PriceChartProps {
  snapshots: PriceSnapshot[];
}

export function PriceChart({ snapshots }: PriceChartProps) {
  const data = snapshots.map((s) => ({
    date: format(new Date(s.timestamp), "MMM dd"),
    price: s.price,
  }));

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-border bg-card">
        <p className="text-sm text-muted-foreground">No price data available</p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(222 20% 18%)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }}
            axisLine={{ stroke: "hsl(222 20% 18%)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            domain={["auto", "auto"]}
            tickFormatter={(v: number) =>
              v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v.toFixed(0)}`
            }
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(222 44% 9%)",
              border: "1px solid hsl(222 20% 18%)",
              borderRadius: "8px",
              color: "hsl(210 40% 92%)",
              fontSize: 12,
            }}
            labelStyle={{ color: "hsl(215 20% 55%)" }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, "Price"]}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="hsl(174 60% 45%)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "hsl(174 60% 45%)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
