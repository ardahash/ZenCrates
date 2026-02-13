import Link from "next/link";
import type { Crate } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

const CATEGORY_LABELS: Record<string, string> = {
  exposure: "Exposure",
  strategy: "Strategy",
  "signal-nft": "Signal NFT",
};

const RISK_COLORS: Record<string, string> = {
  low: "border-zen-teal/40 text-zen-teal",
  medium: "border-chart-4/40 text-chart-4",
  high: "border-destructive/40 text-destructive",
};

const CATEGORY_ACCENTS: Record<string, string> = {
  exposure:
    "bg-[radial-gradient(120%_120%_at_0%_0%,rgba(20,184,166,0.18)_0%,rgba(15,23,42,0)_60%)]",
  strategy:
    "bg-[radial-gradient(120%_120%_at_0%_0%,rgba(99,102,241,0.2)_0%,rgba(15,23,42,0)_60%)]",
  "signal-nft":
    "bg-[radial-gradient(120%_120%_at_0%_0%,rgba(245,158,11,0.2)_0%,rgba(15,23,42,0)_60%)]",
};

export function CrateCard({ crate }: { crate: Crate }) {
  const isPositive = crate.priceChange24h >= 0;

  return (
    <Card className="group relative overflow-hidden border-border bg-card/90 hover:border-zen-teal/30 transition-colors">
      <div
        className={cn(
          "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100",
          CATEGORY_ACCENTS[crate.category] ?? CATEGORY_ACCENTS.exposure
        )}
      />
      <div className="pointer-events-none absolute -top-24 right-[-40px] h-40 w-40 rounded-full bg-zen-teal/10 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-80" />
      <CardHeader className="relative z-10 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-foreground text-base truncate">
              {crate.name}
            </CardTitle>
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
              {crate.ticker}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5 shrink-0">
            <Badge
              variant="outline"
              className="border-border text-muted-foreground text-xs"
            >
              {CATEGORY_LABELS[crate.category]}
            </Badge>
            <Badge
              variant="outline"
              className={cn("text-xs capitalize", RISK_COLORS[crate.riskLevel])}
            >
              {crate.riskLevel}
            </Badge>
          </div>
        </div>
        <CardDescription className="mt-2 text-muted-foreground text-sm line-clamp-2">
          {crate.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-xs text-muted-foreground">Index Price</p>
            <p className="text-xl font-semibold text-foreground font-mono">
              {formatCurrency(crate.currentPrice)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">24h</p>
            <div
              className={cn(
                "flex items-center gap-0.5 text-sm font-medium",
                isPositive ? "text-zen-teal" : "text-destructive"
              )}
            >
              {isPositive ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" />
              )}
              {Math.abs(crate.priceChange24h).toFixed(2)}%
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">TVL</p>
            <p className="text-sm font-medium text-foreground">
              {formatCurrency(crate.tvl)}
            </p>
          </div>
          <Badge variant="outline" className="border-border text-muted-foreground text-xs">
            {crate.collateralType}
          </Badge>
        </div>
        <Button
          asChild
          variant="outline"
          className="mt-4 w-full border-border text-foreground hover:bg-zen-teal/10 hover:text-zen-teal hover:border-zen-teal/30"
        >
          <Link href={`/crates/${crate.id}`}>Details</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
