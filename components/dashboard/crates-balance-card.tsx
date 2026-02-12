"use client";

import type { RewardSummary } from "@/lib/types";
import Link from "next/link";
import { ArrowRight, Percent } from "lucide-react";

interface CratesBalanceCardProps {
  rewards: RewardSummary | null;
}

export function CratesBalanceCard({ rewards }: CratesBalanceCardProps) {
  if (!rewards) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zen-teal/10">
            <Percent className="h-5 w-5 text-zen-teal" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground">
              CRATES Token
            </h3>
            <p className="text-xs text-muted-foreground">
              Fee rebate status
            </p>
          </div>
        </div>
        <Link
          href="/rewards"
          className="inline-flex items-center gap-1 text-sm text-zen-teal hover:underline"
        >
          View rebate details
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-4">
        <div className="rounded-md bg-muted p-3">
          <p className="text-xs text-muted-foreground">Balance</p>
          <p className="mt-1 font-mono font-medium text-foreground">
            {rewards.cratesBalance.toLocaleString()}
          </p>
        </div>
        <div className="rounded-md bg-muted p-3">
          <p className="text-xs text-muted-foreground">Tier</p>
          <p className="mt-1 font-medium text-zen-teal">
            {rewards.tierLabel}
          </p>
        </div>
        <div className="rounded-md bg-muted p-3">
          <p className="text-xs text-muted-foreground">Rebate Rate</p>
          <p className="mt-1 font-mono font-medium text-zen-teal">
            {rewards.rebatePercent}%
          </p>
        </div>
        <div className="rounded-md bg-muted p-3">
          <p className="text-xs text-muted-foreground">Est. Credit (Month)</p>
          <p className="mt-1 font-mono font-medium text-zen-teal">
            -${rewards.estimatedRebateThisMonth.toFixed(2)}
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Fee rebates are discounts on protocol fees, not yield or investment
        returns. Rates are set by governance and subject to change.
      </p>
    </div>
  );
}
