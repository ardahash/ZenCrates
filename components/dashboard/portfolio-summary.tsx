import type { Portfolio } from "@/lib/types";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PortfolioSummaryProps {
  portfolio: Portfolio;
}

export function PortfolioSummary({ portfolio }: PortfolioSummaryProps) {
  const isPositive = portfolio.totalPnl >= 0;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-lg border border-border bg-card p-6">
        <p className="text-xs text-muted-foreground">Total Value</p>
        <p className="mt-2 text-2xl font-bold font-mono text-foreground">
          ${portfolio.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <p className="text-xs text-muted-foreground">Total PnL</p>
        <div className="mt-2 flex items-center gap-2">
          <p
            className={cn(
              "text-2xl font-bold font-mono",
              isPositive ? "text-zen-teal" : "text-destructive"
            )}
          >
            {isPositive ? "+" : ""}$
            {Math.abs(portfolio.totalPnl).toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </p>
          <div
            className={cn(
              "flex items-center text-sm",
              isPositive ? "text-zen-teal" : "text-destructive"
            )}
          >
            {isPositive ? (
              <ArrowUpRight className="h-4 w-4" />
            ) : (
              <ArrowDownRight className="h-4 w-4" />
            )}
            {Math.abs(portfolio.totalPnlPercent).toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <p className="text-xs text-muted-foreground">Positions</p>
        <p className="mt-2 text-2xl font-bold text-foreground">
          {portfolio.positions.length}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">Active crates</p>
      </div>
    </div>
  );
}
