"use client";

import type { TierRule } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface TierTableProps {
  tiers: TierRule[];
}

export function TierTable({ tiers }: TierTableProps) {
  const { wallet } = useAppStore();

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Tier
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                CRATES Held
              </th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                Fee Rebate
              </th>
            </tr>
          </thead>
          <tbody>
            {tiers.map((tier) => {
              const isUserTier =
                wallet.isConnected && wallet.cratesTier === tier.tier;
              return (
                <tr
                  key={tier.tier}
                  className={cn(
                    "border-b border-border last:border-b-0 transition-colors",
                    isUserTier && "bg-zen-teal/5"
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "font-medium",
                          isUserTier ? "text-zen-teal" : "text-foreground"
                        )}
                      >
                        {tier.label}
                      </span>
                      {isUserTier && (
                        <span className="inline-flex items-center rounded-full bg-zen-teal/10 px-2 py-0.5 text-xs font-medium text-zen-teal">
                          Your tier
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">
                    {tier.maxBalance !== null
                      ? `${tier.minBalance.toLocaleString()} - ${tier.maxBalance.toLocaleString()}`
                      : `${tier.minBalance.toLocaleString()}+`}
                  </td>
                  <td
                    className={cn(
                      "px-4 py-3 text-right font-mono font-medium",
                      tier.rebatePercent > 0
                        ? "text-zen-teal"
                        : "text-muted-foreground"
                    )}
                  >
                    {tier.rebatePercent}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
