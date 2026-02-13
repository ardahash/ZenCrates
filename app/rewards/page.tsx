"use client";

// TODO: Replace with real wallet-specific rewards data from backend

import { useQuery } from "@tanstack/react-query";
import type { RewardSummary } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet, AlertTriangle, Percent, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { WalletButton } from "@/components/wallet-button";
import { StakingPanel } from "@/components/staking/staking-panel";

export default function RewardsPage() {
  const { address, isConnected } = useAccount();

  const { data: rewards, isLoading } = useQuery<RewardSummary>({
    queryKey: ["rewards", address],
    queryFn: () =>
      fetch(`/api/rewards?wallet=${address}`).then((r) => r.json()),
    enabled: isConnected && !!address,
  });

  if (!isConnected) {
    return (
      <div className="bg-background">
        <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Wallet className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Connect your wallet
            </h1>
            <p className="mt-2 max-w-md text-muted-foreground">
              Connect your wallet to view your fee rebate history and
              estimated credits.
            </p>
            <div className="mt-8">
              <WalletButton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Fee Rebates</h1>
          <p className="mt-2 text-muted-foreground">
            Fee rebates are discounts applied to protocol fees based on your
            CRATES holdings.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-6">
            <div className="grid gap-4 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-64 rounded-lg" />
          </div>
        ) : rewards ? (
          <div className="flex flex-col gap-8">
            {/* Summary cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-border bg-card p-5">
                <p className="text-xs text-muted-foreground">CRATES Balance</p>
                <p className="mt-2 text-2xl font-bold font-mono text-foreground">
                  {rewards.cratesBalance.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-5">
                <p className="text-xs text-muted-foreground">Current Tier</p>
                <p className="mt-2 text-2xl font-bold text-zen-teal">
                  {rewards.tierLabel}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {rewards.rebatePercent}% fee discount
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-5">
                <p className="text-xs text-muted-foreground">
                  Fees This Month
                </p>
                <p className="mt-2 text-2xl font-bold font-mono text-foreground">
                  ${rewards.feesThisMonth.toFixed(2)}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-5">
                <p className="text-xs text-muted-foreground">
                  Est. Rebate This Month
                </p>
                <p className="mt-2 text-2xl font-bold font-mono text-zen-teal">
                  -${rewards.estimatedRebateThisMonth.toFixed(2)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Fee credit (discount)
                </p>
              </div>
            </div>

            {/* Link to token page */}
            <Link
              href="/crates-token"
              className="inline-flex items-center gap-1.5 text-sm text-zen-teal hover:underline self-start"
            >
              <Percent className="h-3.5 w-3.5" />
              View tier structure and increase your rebate
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <div>
              <h2 className="mb-4 text-lg font-semibold text-foreground">
                Stake CRATES
              </h2>
              <StakingPanel />
            </div>

            {/* History table */}
            <div>
              <h2 className="mb-4 text-lg font-semibold text-foreground">
                Rebate History
              </h2>
              <div className="rounded-lg border border-border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                          Month
                        </th>
                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                          Fees Paid
                        </th>
                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                          Rebate Applied
                        </th>
                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                          Net Fees
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rewards.history.map((entry) => (
                        <tr
                          key={entry.month}
                          className="border-b border-border last:border-b-0"
                        >
                          <td className="px-4 py-3 text-foreground">
                            {entry.month}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                            ${entry.feesPaid.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-zen-teal">
                            -${entry.rebateApplied.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-foreground font-medium">
                            ${entry.netFees.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="rounded-md border border-border bg-muted p-4">
              <div className="flex gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-chart-4 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Fee rebates are discounts/credits applied to protocol fees.
                  They are not interest or performance-based distributions.
                  Rebate rates and tier thresholds are discretionary parameters
                  controlled by governance and subject to change or
                  discontinuation at any time. CRATES is a utility token and
                  not a security.
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
