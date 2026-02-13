"use client";

// TODO: Wire to real bridge contract / relayer
// TODO: Integrate wallet chain switching

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowRight, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const BRIDGE_STEPS = [
  { step: 1, label: "Approve CRATES for bridge contract", status: "pending" },
  { step: 2, label: "Initiate bridge transaction", status: "pending" },
  { step: 3, label: "Wait for relayer confirmation", status: "pending" },
  { step: 4, label: "Receive bridged CRATES on destination", status: "pending" },
] as const;

export function BridgeModule() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="text-foreground font-medium mb-2">Bridge CRATES</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Transfer CRATES between Horizen L3 and Base.
      </p>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full border-border text-foreground hover:bg-muted"
          >
            <span>Horizen L3</span>
            <ArrowRight className="mx-2 h-4 w-4 text-muted-foreground" />
            <span>Base</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Bridge CRATES</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Bridging is not yet available. The steps below illustrate the
              planned process.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 my-4">
            {BRIDGE_STEPS.map((step) => (
              <div
                key={step.step}
                className="flex items-center gap-3 rounded-md bg-muted p-3"
              >
                <div
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                    "border border-border text-muted-foreground"
                  )}
                >
                  {step.step}
                </div>
                <span className="text-sm text-muted-foreground">
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
            <div className="flex gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-destructive mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Bridging involves cross-chain messaging and carries additional
                risk including smart contract risk on both chains and relayer
                availability. CRATES is a utility token and not a security.
              </p>
            </div>
          </div>

          <Button
            disabled
            className="w-full bg-muted text-muted-foreground cursor-not-allowed mt-2"
          >
            Bridging coming soon
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
