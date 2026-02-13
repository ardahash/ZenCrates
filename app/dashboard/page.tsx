"use client";

// TODO: Replace with real wallet reads + contract position data

import { useQuery } from "@tanstack/react-query";
import type { Portfolio, RewardSummary } from "@/lib/types";
import { PortfolioSummary } from "@/components/dashboard/portfolio-summary";
import { PositionsTable } from "@/components/dashboard/positions-table";
import { AlertsList } from "@/components/dashboard/alerts-list";
import { CratesBalanceCard } from "@/components/dashboard/crates-balance-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet } from "lucide-react";
import { useAccount } from "wagmi";
import { WalletButton } from "@/components/wallet-button";

export default function DashboardPage() {
  const { address, isConnected } = useAccount();

  const { data: portfolio, isLoading } = useQuery<Portfolio>({
    queryKey: ["portfolio", address],
    queryFn: () =>
      fetch(`/api/portfolio?wallet=${address}`).then((r) => r.json()),
    enabled: isConnected && !!address,
  });

  const { data: rewards } = useQuery<RewardSummary>({
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
              Connect your wallet to view your portfolio, positions, and
              alerts across all ZenCrates.
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Your portfolio overview and positions.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-64 rounded-lg" />
          </div>
        ) : portfolio ? (
          <div className="flex flex-col gap-8">
            <PortfolioSummary portfolio={portfolio} />
            <CratesBalanceCard rewards={rewards ?? null} />
            <PositionsTable positions={portfolio.positions} />
            <AlertsList />
          </div>
        ) : null}
      </div>
    </div>
  );
}
