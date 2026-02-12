"use client";

// TODO: Replace with real contract/backend reads for program configuration

import { useQuery } from "@tanstack/react-query";
import type { TierRule } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Info } from "lucide-react";

export function RebateProgramPanel() {
  const { data: tiers, isLoading } = useQuery<TierRule[]>({
    queryKey: ["tiers"],
    queryFn: () => fetch("/api/tiers").then((r) => r.json()),
  });

  if (isLoading) {
    return <Skeleton className="h-64 rounded-lg" />;
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="text-foreground text-base">
              Fee Rebate Program
            </CardTitle>
            <span className="inline-flex items-center rounded-full bg-zen-teal/10 px-2 py-0.5 text-xs font-medium text-zen-teal">
              Active
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            The fee rebate program provides tiered fee discounts to CRATES
            token holders. This program is controlled by governance — any
            changes to tiers, thresholds, or rebate percentages require a
            governance vote.
          </p>

          <div className="rounded-md bg-muted p-3 mb-6">
            <div className="flex gap-2">
              <Info className="h-4 w-4 shrink-0 text-zen-teal mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                This is a read-only view of the current rebate program
                parameters. To propose changes, create a governance proposal.
              </p>
            </div>
          </div>

          {/* Tier config table */}
          {tiers && (
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Tier
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Label
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Min Balance
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Max Balance
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                      Rebate %
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tiers.map((tier) => (
                    <tr
                      key={tier.tier}
                      className="border-b border-border last:border-b-0"
                    >
                      <td className="px-4 py-3 font-mono text-foreground">
                        {tier.tier}
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {tier.label}
                      </td>
                      <td className="px-4 py-3 font-mono text-muted-foreground">
                        {tier.minBalance.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-mono text-muted-foreground">
                        {tier.maxBalance !== null
                          ? tier.maxBalance.toLocaleString()
                          : "No limit"}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-medium text-zen-teal">
                        {tier.rebatePercent}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <div className="rounded-md border border-border bg-muted p-4">
        <div className="flex gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-chart-4 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Rebate parameters shown above are the current governance-approved
            configuration. They can be modified via governance proposal.
            Rebates are fee discounts/credits, not yield, dividends, or
            investment returns. CRATES is not a security.
          </p>
        </div>
      </div>
    </div>
  );
}
