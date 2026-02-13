"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import type { Crate, PriceSnapshot } from "@/lib/types";
import { PriceChart } from "@/components/crates/price-chart";
import { ActionsPanel } from "@/components/crates/actions-panel";
import { DeveloperPanel } from "@/components/crates/developer-panel";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpRight, ArrowDownRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

const RISK_COLORS: Record<string, string> = {
  low: "border-zen-teal/40 text-zen-teal",
  medium: "border-chart-4/40 text-chart-4",
  high: "border-destructive/40 text-destructive",
};

export default function CrateDetailPage() {
  const params = useParams<{ id: string }>();

  const { data, isLoading } = useQuery<{
    crate: Crate;
    priceHistory: PriceSnapshot[];
  }>({
    queryKey: ["crate", params.id],
    queryFn: () => fetch(`/api/crates/${params.id}`).then((r) => r.json()),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <Skeleton className="mb-4 h-8 w-48" />
        <Skeleton className="mb-8 h-4 w-96" />
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Skeleton className="h-64 rounded-lg" />
          </div>
          <Skeleton className="h-96 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!data?.crate) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center lg:px-8">
        <h1 className="text-2xl font-bold text-foreground">Crate not found</h1>
        <p className="mt-2 text-muted-foreground">
          The crate you are looking for does not exist.
        </p>
        <Button asChild variant="outline" className="mt-6 border-border text-foreground">
          <Link href="/crates">Back to Explore</Link>
        </Button>
      </div>
    );
  }

  const { crate, priceHistory } = data;
  const isPositive = crate.priceChange24h >= 0;

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        {/* Back link */}
        <Link
          href="/crates"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Explore
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-start gap-3 mb-2">
            <h1 className="text-3xl font-bold text-foreground">{crate.name}</h1>
            <Badge
              variant="outline"
              className="border-border text-muted-foreground capitalize"
            >
              {crate.category}
            </Badge>
            <Badge
              variant="outline"
              className={cn("capitalize", RISK_COLORS[crate.riskLevel])}
            >
              {crate.riskLevel} risk
            </Badge>
          </div>
          <p className="font-mono text-sm text-muted-foreground">
            {crate.ticker}
          </p>
          <p className="mt-3 max-w-3xl text-muted-foreground leading-relaxed">
            {crate.description}
          </p>
        </div>

        {/* Stats row */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Index Price</p>
            <p className="mt-1 text-xl font-semibold font-mono text-foreground">
              {formatCurrency(crate.currentPrice)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">24h Change</p>
            <div
              className={cn(
                "mt-1 flex items-center gap-1 text-xl font-semibold",
                isPositive ? "text-zen-teal" : "text-destructive"
              )}
            >
              {isPositive ? (
                <ArrowUpRight className="h-5 w-5" />
              ) : (
                <ArrowDownRight className="h-5 w-5" />
              )}
              {Math.abs(crate.priceChange24h).toFixed(2)}%
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">TVL</p>
            <p className="mt-1 text-xl font-semibold text-foreground">
              {formatCurrency(crate.tvl)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Collateral</p>
            <p className="mt-1 text-xl font-semibold text-foreground">
              {crate.collateralType}
            </p>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left column: chart + info */}
          <div className="flex flex-col gap-8 lg:col-span-2">
            {/* Chart */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 text-foreground font-medium">
                Price History (30d)
              </h2>
              <PriceChart snapshots={priceHistory} />
            </div>

            {/* Accordion info */}
            <Accordion type="multiple" className="rounded-lg border border-border bg-card">
              <AccordionItem value="how-it-works" className="border-border px-6">
                <AccordionTrigger className="text-foreground text-sm hover:no-underline">
                  How it works
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                  {crate.longDescription}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="risks" className="border-border px-6">
                <AccordionTrigger className="text-foreground text-sm hover:no-underline">
                  Risks
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                  Synthetic tokens carry inherent risks including smart
                  contract vulnerability, oracle manipulation or downtime,
                  collateral under-backing during extreme market conditions,
                  and liquidity risk. The value of your position can decline
                  to zero. This is experimental DeFi software - not
                  financial advice.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem
                value="oracle-cadence"
                className="border-border border-b-0 px-6"
              >
                <AccordionTrigger className="text-foreground text-sm hover:no-underline">
                  Oracle update cadence
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                  Oracle price feeds are updated at variable intervals
                  depending on the data source. On-chain oracles may update
                  every block or on deviation thresholds. Off-chain feeds
                  are polled at intervals configured in the oracle registry.
                  Consult the Developer Info panel for specific source
                  details.
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Developer panel */}
            <DeveloperPanel crate={crate} />
          </div>

          {/* Right column: actions */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <ActionsPanel crate={crate} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
