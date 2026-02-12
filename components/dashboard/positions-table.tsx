import type { Position } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface PositionsTableProps {
  positions: Position[];
}

export function PositionsTable({ positions }: PositionsTableProps) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="p-6 pb-4">
        <h2 className="text-foreground font-medium">Positions</h2>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Crate</TableHead>
              <TableHead className="text-muted-foreground">Category</TableHead>
              <TableHead className="text-muted-foreground text-right">
                Balance
              </TableHead>
              <TableHead className="text-muted-foreground text-right">
                Value
              </TableHead>
              <TableHead className="text-muted-foreground text-right">
                PnL
              </TableHead>
              <TableHead className="text-muted-foreground text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {positions.map((pos) => {
              const isPositive = pos.pnl >= 0;
              return (
                <TableRow key={pos.crateId} className="border-border">
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {pos.crateName}
                      </p>
                      <p className="text-xs font-mono text-muted-foreground">
                        {pos.ticker}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="border-border text-muted-foreground capitalize text-xs"
                    >
                      {pos.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm text-foreground">
                    {pos.balance.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm text-foreground">
                    $
                    {pos.value.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div
                      className={cn(
                        "inline-flex items-center gap-0.5 text-sm font-medium font-mono",
                        isPositive ? "text-zen-teal" : "text-destructive"
                      )}
                    >
                      {isPositive ? (
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowDownRight className="h-3.5 w-3.5" />
                      )}
                      {isPositive ? "+" : ""}$
                      {Math.abs(pos.pnl).toFixed(2)}
                      <span className="ml-1 text-xs">
                        ({isPositive ? "+" : ""}
                        {pos.pnlPercent.toFixed(2)}%)
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="text-zen-teal hover:text-zen-teal hover:bg-zen-teal/10 text-xs"
                    >
                      <Link href={`/crates/${pos.crateId}`}>Manage</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
