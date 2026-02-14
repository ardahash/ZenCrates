"use client";

// TODO: Replace with real contract reads + backend calls for token data
// TODO: Integrate wallet chain switching for buy/bridge flows

import { useQuery } from "@tanstack/react-query";
import type { RewardSummary, TokenMeta, TierRule } from "@/lib/types";
import { TierTable } from "@/components/token/tier-table";
import { YourTierCard } from "@/components/token/your-tier-card";
import { BuyModule } from "@/components/token/buy-module";
import { ZenStakingModule } from "@/components/token/zen-staking-module";
import { BridgeModule } from "@/components/token/bridge-module";
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
            <Skeleton className="h-40 rounded-lg" />
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left column */}
            <div className="flex flex-col gap-8 lg:col-span-2">
              {/* Tier Table */}
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

              {/* Disclaimer */}
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

            {/* Right column */}
            <div className="flex flex-col gap-6 lg:col-span-1">
              {tiers && (
                <YourTierCard
                  tiers={tiers}
                  rewards={rewards}
                  isConnected={isConnected}
                  isLoading={rewardsLoading}
                />
              )}
              <StakingPanel />
              <BuyModule />
              <ZenStakingModule />
              <BridgeModule />
              <BaseStakingPanel />
              {token && <TokenInfoPanel token={token} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
