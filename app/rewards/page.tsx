"use client";

import { ZenStakingModule } from "@/components/token/zen-staking-module";
import { AlertTriangle } from "lucide-react";

export default function RewardsPage() {
  return (
    <div className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Stake ZEN</h1>
          <p className="mt-2 text-muted-foreground">
            Stake ZEN to receive CRATES at the fixed pool rate and accumulate
            claimable incentives over time.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <ZenStakingModule />

          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-base font-semibold text-foreground mb-3">
              How It Works
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              ZEN staking swaps ZEN into CRATES at a fixed pool rate. Unstaking
              requires returning CRATES and applies a 2% ZEN fee to the treasury.
              Incentives accrue over time and are claimable when available.
            </p>
            <div className="mt-4 rounded-md border border-border bg-muted p-4">
              <div className="flex gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-chart-4 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  CRATES is a utility token and not a security. This program
                  does not provide dividends or guaranteed results. Incentive
                  parameters may be updated by governance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
