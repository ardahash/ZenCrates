"use client";

// TODO: Replace with real contract reads + backend calls for token data
// TODO: Integrate wallet chain switching for buy flows

import { useQuery } from "@tanstack/react-query";
import type { RewardSummary, TokenMeta, TierRule } from "@/lib/types";
import { TierTable } from "@/components/token/tier-table";
import { YourTierCard } from "@/components/token/your-tier-card";
import { BuyModule } from "@/components/token/buy-module";
import { ZenStakingModule } from "@/components/token/zen-staking-module";
import { TokenInfoPanel } from "@/components/token/token-info-panel";
import { StakingPanel } from "@/components/staking/staking-panel";
import { BaseStakingPanel } from "@/components/staking/base-staking-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Shield, Vote, Percent } from "lucide-react";
import { useAccount } from "wagmi";

export default function CratesTokenPage() {
  const { address, isConnected } = useAccount();
  const { data: token, isLoading: tokenLoading } = useQuery<TokenMeta>({
    queryKey: ["token"],
    queryFn: () => fetch("/api/token").then((r) => r.json()),
  });

  const { data: tiers, isLoading: tiersLoading } = useQuery<TierRule[]>({
    queryKey: ["tiers"],
    queryFn: () => fetch("/api/tiers").then((r) => r.json()),
  });

  const { data: rewards, isLoading: rewardsLoading } = useQuery<RewardSummary>({
    queryKey: ["rewards", address],
    queryFn: () =>
      fetch(`/api/rewards?wallet=${address}`).then((r) => r.json()),
    enabled: isConnected && !!address,
  });

  const isLoading = tokenLoading || tiersLoading;

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-foreground">CRATES Token</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground leading-relaxed">
            CRATES is the utility token for the ZenCrates protocol. Holding
            CRATES unlocks tiered fee rebates - discounts on protocol fees
            based on your token balance.
          </p>
        </div>

        {/* Utility cards */}
        <div className="mb-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-zen-teal/10">
              <Percent className="h-4 w-4 text-zen-teal" />
            </div>
            <h3 className="text-foreground font-medium text-sm">Fee Rebates</h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Receive discounts on protocol mint, burn, and management fees
              based on your CRATES holdings tier.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-zen-teal/10">
              <Vote className="h-4 w-4 text-zen-teal" />
            </div>
            <h3 className="text-foreground font-medium text-sm">Governance</h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Participate in protocol governance - vote on proposals that
              shape fee structures, crate parameters, and rebate programs.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-zen-teal/10">
              <Shield className="h-4 w-4 text-zen-teal" />
            </div>
            <h3 className="text-foreground font-medium text-sm">Access</h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Higher tiers may unlock early access to new crates, strategy
              previews, and protocol feature releases.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-6">
            <Skeleton className="h-64 rounded-lg" />
            <Skeleton className="h-64 rounded-lg" />
            <Skeleton className="h-40 rounded-lg" />
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {/* Action Row */}
            <div className="grid gap-6 lg:grid-cols-3">
              <BuyModule />
              <StakingPanel />
              <ZenStakingModule />
            </div>

            {/* Tier + rebate below actions */}
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="flex flex-col gap-8 lg:col-span-2">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg border border-border bg-card p-5">
                    <p className="text-xs text-muted-foreground">CRATES Balance</p>
                    <p className="mt-2 text-2xl font-bold font-mono text-foreground">
                      {rewards ? rewards.cratesBalance.toLocaleString() : "0"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-5">
                    <p className="text-xs text-muted-foreground">Current Tier</p>
                    <p className="mt-2 text-2xl font-bold text-zen-teal">
                      {rewards ? rewards.tierLabel : "—"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {rewards ? `${rewards.rebatePercent}% fee discount` : "Connect wallet"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-5">
                    <p className="text-xs text-muted-foreground">Fees This Month</p>
                    <p className="mt-2 text-2xl font-bold font-mono text-foreground">
                      ${rewards ? rewards.feesThisMonth.toFixed(2) : "0.00"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-5">
                    <p className="text-xs text-muted-foreground">Est. Rebate This Month</p>
                    <p className="mt-2 text-2xl font-bold font-mono text-zen-teal">
                      -${rewards ? rewards.estimatedRebateThisMonth.toFixed(2) : "0.00"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">Fee credit (discount)</p>
                  </div>
                </div>

                <div>
                  <h2 className="mb-4 text-lg font-semibold text-foreground">
                    Fee Rebate Tiers
                  </h2>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Rebates are applied as discounts on protocol fees.
                    Thresholds and percentages are set by governance and can
                    change.
                  </p>
                  {tiers && (
                    <TierTable tiers={tiers} currentTier={rewards?.currentTier ?? null} />
                  )}
                </div>

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
                          {rewards?.history?.length ? (
                            rewards.history.map((entry) => (
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
                            ))
                          ) : (
                            <tr>
                              <td className="px-4 py-4 text-sm text-muted-foreground" colSpan={4}>
                                No rebate history yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="rounded-md border border-border bg-muted p-4">
                  <div className="flex gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-chart-4 mt-0.5" />
                    <div className="text-xs text-muted-foreground leading-relaxed">
                      <p className="font-medium text-foreground mb-1">
                        Important Disclosures
                      </p>
                      <p>
                        CRATES is a utility token. It is not a security and does
                        not entitle the holder to ownership rights, cash payouts,
                        or guaranteed price changes. Fee rebates are discretionary
                        program parameters controlled by governance; they are
                        subject to change or discontinuation at any time. Holding
                        CRATES carries risks including smart contract
                        vulnerability and market volatility.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-6 lg:col-span-1">
                {tiers && (
                  <YourTierCard
                    tiers={tiers}
                    rewards={rewards}
                    isConnected={isConnected}
                    isLoading={rewardsLoading}
                  />
                )}
                <BaseStakingPanel />
                {token && <TokenInfoPanel token={token} />}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
