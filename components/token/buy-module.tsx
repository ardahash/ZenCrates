"use client";

// TODO: Wire to real on-chain swap / DEX aggregator
// TODO: Integrate wallet chain switching (Horizen L3 vs Base)

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const NETWORKS = [
  { id: "horizen-l3", label: "Horizen L3", tag: "Primary" },
  { id: "base", label: "Base", tag: "Bridged" },
] as const;

export function BuyModule() {
  const [selectedNetwork, setSelectedNetwork] = useState<string>("horizen-l3");

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="text-foreground font-medium mb-4">Buy CRATES</h3>

      <div className="flex flex-col gap-4">
        <div>
          <Label className="text-sm text-muted-foreground mb-2 block">
            Network
          </Label>
          <div className="flex gap-2">
            {NETWORKS.map((network) => (
              <button
                key={network.id}
                onClick={() => setSelectedNetwork(network.id)}
                className={cn(
                  "flex-1 rounded-md border px-3 py-2.5 text-sm font-medium transition-colors",
                  selectedNetwork === network.id
                    ? "border-zen-teal bg-zen-teal/10 text-zen-teal"
                    : "border-border bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {network.label}
                <span className="ml-1 text-xs opacity-60">
                  ({network.tag})
                </span>
              </button>
            ))}
          </div>
        </div>

        <Button
          disabled
          className="w-full bg-muted text-muted-foreground cursor-not-allowed"
        >
          Coming soon — on-chain swap
        </Button>
        {/* TODO: Codex will wire real swap flow here */}

        <div className="rounded-md bg-muted p-3">
          <div className="flex gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-chart-4 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              CRATES is a utility token that provides fee rebates on the
              ZenCrates protocol. It is not an investment and not a security.
              Token holders receive no dividends, profit share, or guaranteed
              appreciation. Rebates are discretionary program parameters
              controlled by governance and subject to change.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
