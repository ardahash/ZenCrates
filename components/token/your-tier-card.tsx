"use client";

import type { RewardSummary, TierRule } from "@/lib/types";
import { Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { WalletButton } from "@/components/wallet-button";

interface YourTierCardProps {
  tiers: TierRule[];
  rewards?: RewardSummary | null;
  isConnected: boolean;
  isLoading?: boolean;
}

export function YourTierCard({ tiers, rewards, isConnected, isLoading }: YourTierCardProps) {
  if (!isConnected) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="text-foreground font-medium mb-4">Your Tier</h3>
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <Wallet className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Connect your wallet to see your CRATES balance and rebate tier.
          </p>
          <WalletButton />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="text-foreground font-medium mb-4">Your Tier</h3>
        <div className="text-sm text-muted-foreground">Loading wallet data…</div>
      </div>
    );
  }

  const currentTier = tiers.find((t) => t.tier === rewards?.currentTier);
  const nextTier = tiers.find((t) => t.tier === (currentTier?.tier ?? 0) + 1);
  const balance = rewards?.cratesBalance ?? 0;

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="text-foreground font-medium mb-4">Your Tier</h3>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">CRATES Balance</span>
          <span className="font-mono font-medium text-foreground">
            {balance.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Current Tier</span>
          <span
            className={cn(
              "font-medium",
              currentTier && currentTier.rebatePercent > 0
                ? "text-zen-teal"
                : "text-muted-foreground"
            )}
          >
            {currentTier?.label ?? "Unknown"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Fee Rebate</span>
          <span className="font-mono font-medium text-zen-teal">
            {currentTier?.rebatePercent ?? 0}%
          </span>
        </div>
        {nextTier && (
          <div className="mt-2 rounded-md bg-muted p-3">
            <p className="text-xs text-muted-foreground">
              Hold{" "}
              <span className="font-mono text-foreground">
                {nextTier.minBalance.toLocaleString()}
              </span>{" "}
              CRATES to reach{" "}
              <span className="text-foreground font-medium">
                {nextTier.label}
              </span>{" "}
              ({nextTier.rebatePercent}% rebate).
            </p>
          </div>
        )}
      </div>
    </div>
  );
}