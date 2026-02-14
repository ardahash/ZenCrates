"use client";

import { useQuery } from "@tanstack/react-query";
import type { Crate } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function StatsPage() {
  const { data, isLoading } = useQuery<{ crates: Crate[] }>({
    queryKey: ["crates"],
    queryFn: () => fetch("/api/crates").then((r) => r.json()),
  });

  const crates = data?.crates ?? [];
  const totalTvl = crates.reduce((acc, crate) => acc + (crate.tvl ?? 0), 0);
  const activeCount = crates.filter((crate) => crate.isActive).length;
  const avgChange =
    crates.length > 0
      ? crates.reduce((acc, crate) => acc + (crate.priceChange24h ?? 0), 0) /
        crates.length
      : 0;
  const topCrates = [...crates]
    .sort((a, b) => (b.tvl ?? 0) - (a.tvl ?? 0))
    .slice(0, 6);
  const largestCrate = topCrates[0];

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Protocol Stats</h1>
          <p className="mt-2 text-muted-foreground">
            Live protocol statistics across all ZenCrates offerings.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-64 rounded-lg" />
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-border bg-card p-5">
                <p className="text-xs text-muted-foreground">Total TVL</p>
                <p className="mt-2 text-2xl font-bold font-mono text-foreground">
                  ${totalTvl.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-5">
                <p className="text-xs text-muted-foreground">Active Crates</p>
                <p className="mt-2 text-2xl font-bold text-foreground">
                  {activeCount}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-5">
                <p className="text-xs text-muted-foreground">Avg 24h Move</p>
                <p
                  className={`mt-2 text-2xl font-bold ${
                    avgChange >= 0 ? "text-zen-teal" : "text-chart-4"
                  }`}
                >
                  {avgChange.toFixed(2)}%
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-5">
                <p className="text-xs text-muted-foreground">Largest Crate</p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {largestCrate ? largestCrate.name : "—"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {largestCrate ? `$${largestCrate.tvl.toLocaleString("en-US", { maximumFractionDigits: 2 })}` : ""}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  Top Crates by TVL
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        Crate
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                        TVL
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                        24h
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {topCrates.map((crate) => (
                      <tr key={crate.id} className="border-b border-border last:border-b-0">
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-foreground font-medium">
                              {crate.name}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {crate.ticker}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-foreground">
                          ${crate.tvl.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-mono ${
                            crate.priceChange24h >= 0 ? "text-zen-teal" : "text-chart-4"
                          }`}
                        >
                          {crate.priceChange24h.toFixed(2)}%
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-foreground">
                          ${crate.currentPrice.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    {topCrates.length === 0 && (
                      <tr>
                        <td className="px-4 py-3 text-center text-muted-foreground" colSpan={4}>
                          No data available yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-md border border-border bg-muted p-4 text-xs text-muted-foreground">
              TVL and price changes are derived from oracle feeds and on-chain
              balances. These are informational statistics, not guarantees.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
