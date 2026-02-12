"use client";

import type { TokenMeta } from "@/lib/types";
import { ExternalLink } from "lucide-react";

interface TokenInfoPanelProps {
  token: TokenMeta;
}

export function TokenInfoPanel({ token }: TokenInfoPanelProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="text-foreground font-medium mb-4">Token Info</h3>

      <div className="flex flex-col gap-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Name</span>
          <span className="text-foreground font-medium">{token.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Symbol</span>
          <span className="font-mono text-foreground">{token.symbol}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Decimals</span>
          <span className="font-mono text-foreground">{token.decimals}</span>
        </div>

        <div className="h-px bg-border my-1" />

        <div>
          <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">
            Horizen L3 (Primary)
          </p>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Contract</span>
              <span className="font-mono text-xs text-foreground truncate max-w-[180px]">
                {token.chains.horizenL3.address}
              </span>
            </div>
            <a
              href={token.chains.horizenL3.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-zen-teal hover:underline"
            >
              View on Explorer
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        <div className="h-px bg-border my-1" />

        <div>
          <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">
            Base (Bridged)
          </p>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Contract</span>
              <span className="font-mono text-xs text-foreground truncate max-w-[180px]">
                {token.chains.base.address}
              </span>
            </div>
            <a
              href={token.chains.base.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-zen-teal hover:underline"
            >
              View on Explorer
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
