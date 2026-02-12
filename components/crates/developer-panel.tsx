import type { Crate } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Download, Copy } from "lucide-react";
import { toast } from "sonner";

interface DeveloperPanelProps {
  crate: Crate;
}

export function DeveloperPanel({ crate }: DeveloperPanelProps) {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-foreground text-base">
          Developer Info
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Contract Address */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">
            Contract Address
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded bg-muted px-2 py-1.5 text-xs font-mono text-foreground">
              {crate.contractAddress}
            </code>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={() =>
                copyToClipboard(crate.contractAddress, "Contract address")
              }
            >
              <Copy className="h-3.5 w-3.5" />
              <span className="sr-only">Copy contract address</span>
            </Button>
          </div>
        </div>

        {/* Explorer Link */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">Explorer</p>
          {/* TODO: Replace with real explorer URL */}
          <a
            href={crate.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-zen-teal hover:underline"
          >
            View on Horizen Explorer
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Oracle Sources */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Oracle Sources</p>
          <div className="flex flex-col gap-2">
            {crate.oracleSources.map((source) => (
              <div
                key={source.name}
                className="flex items-center justify-between rounded bg-muted px-3 py-2"
              >
                <div>
                  <p className="text-xs font-medium text-foreground">
                    {source.name}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {source.type}
                  </p>
                </div>
                <code className="text-xs font-mono text-muted-foreground truncate max-w-28">
                  {source.endpoint}
                </code>
              </div>
            ))}
          </div>
        </div>

        {/* ABI Download */}
        <Button
          variant="outline"
          className="w-full border-border text-foreground hover:bg-muted"
          disabled
        >
          <Download className="mr-2 h-4 w-4" />
          Download ABI (Soon)
        </Button>
      </CardContent>
    </Card>
  );
}
