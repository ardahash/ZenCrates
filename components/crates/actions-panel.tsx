"use client";

// TODO: Replace with real contract write calls (mint/burn/deposit/withdraw)
// TODO: Integrate real wallet balances and slippage calculations

import type { Crate } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertTriangle, Wallet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ActionsPanelProps {
  crate: Crate;
}

export function ActionsPanel({ crate }: ActionsPanelProps) {
  const { wallet, connectWallet } = useAppStore();
  const [amount, setAmount] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<string>("");

  const isExposure = crate.category === "exposure";

  const handleAction = (action: string) => {
    setPendingAction(action);
    setConfirmOpen(true);
  };

  const confirmAction = () => {
    // TODO: Execute real contract write
    toast.success(
      `${pendingAction} submitted (placeholder). Amount: ${amount} ${crate.collateralType}`
    );
    setConfirmOpen(false);
    setAmount("");
  };

  if (!wallet.isConnected) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <Wallet className="h-10 w-10 text-muted-foreground" />
          <div>
            <h3 className="text-foreground font-medium">Connect your wallet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              To interact with this crate, connect your wallet first.
            </p>
          </div>
          <Button
            onClick={connectWallet}
            className="bg-zen-teal text-background hover:bg-zen-teal/90"
          >
            Connect Wallet
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-foreground font-medium">Actions</h3>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Connected</p>
          <p className="text-sm font-mono text-foreground">{wallet.address}</p>
        </div>
      </div>

      <div className="mb-4 rounded-md bg-muted p-3">
        <p className="text-xs text-muted-foreground">Wallet Balance</p>
        <p className="text-sm font-medium text-foreground">{wallet.balance}</p>
      </div>

      <Tabs defaultValue={isExposure ? "mint" : "deposit"}>
        <TabsList className="w-full bg-muted">
          {isExposure ? (
            <>
              <TabsTrigger value="mint" className="flex-1">
                Mint
              </TabsTrigger>
              <TabsTrigger value="burn" className="flex-1">
                Burn
              </TabsTrigger>
            </>
          ) : (
            <>
              <TabsTrigger value="deposit" className="flex-1">
                Deposit
              </TabsTrigger>
              <TabsTrigger value="withdraw" className="flex-1">
                Withdraw
              </TabsTrigger>
            </>
          )}
        </TabsList>

        {(isExposure ? ["mint", "burn"] : ["deposit", "withdraw"]).map(
          (action) => (
            <TabsContent key={action} value={action} className="mt-4">
              <div className="flex flex-col gap-4">
                <div>
                  <Label htmlFor={`${action}-amount`} className="text-foreground text-sm">
                    Amount ({crate.collateralType})
                  </Label>
                  <Input
                    id={`${action}-amount`}
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-1.5 bg-muted border-border text-foreground font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Protocol Fee</span>
                    <span>
                      {(
                        (action === "mint" || action === "deposit"
                          ? crate.fees.mint
                          : crate.fees.burn) * 100
                      ).toFixed(2)}
                      %
                    </span>
                  </div>
                  {/* TODO: Read real rebate from backend/contract based on wallet CRATES balance */}
                  {wallet.cratesBalance > 0 && (
                    <div className="flex justify-between text-zen-teal">
                      <span>Your Rebate (Tier {wallet.cratesTier})</span>
                      <span>
                        -
                        {wallet.cratesTier === 1
                          ? "10"
                          : wallet.cratesTier === 2
                            ? "20"
                            : wallet.cratesTier === 3
                              ? "30"
                              : wallet.cratesTier === 4
                                ? "40"
                                : "0"}
                        %
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Slippage tolerance</span>
                    <span>0.5%</span>
                    {/* TODO: make configurable */}
                  </div>
                </div>

                <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => handleAction(action)}
                      disabled={!amount || Number(amount) <= 0}
                      className="w-full bg-zen-teal text-background hover:bg-zen-teal/90 capitalize"
                    >
                      {action}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card border-border">
                    <DialogHeader>
                      <DialogTitle className="text-foreground capitalize">
                        Confirm {pendingAction}
                      </DialogTitle>
                      <DialogDescription className="text-muted-foreground">
                        You are about to {pendingAction} {amount}{" "}
                        {crate.collateralType} in {crate.name}.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
                      <div className="flex gap-2">
                        <AlertTriangle className="h-4 w-4 shrink-0 text-destructive mt-0.5" />
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Risk disclosure: Synthetic tokens carry smart
                          contract risk, oracle risk, and market risk. The
                          value of synthetic positions can go to zero. This
                          is not investment advice.
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setConfirmOpen(false)}
                        className="border-border text-foreground"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={confirmAction}
                        className="bg-zen-teal text-background hover:bg-zen-teal/90 capitalize"
                      >
                        Confirm {pendingAction}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </TabsContent>
          )
        )}
      </Tabs>
    </div>
  );
}
