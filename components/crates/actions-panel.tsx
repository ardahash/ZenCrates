"use client";

import type { Crate } from "@/lib/types";
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
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  useAccount,
  useBalance,
  useChainId,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { CHAIN_IDS } from "@/lib/addresses";
import { WalletButton } from "@/components/wallet-button";
import { ethCollateralCrateAbi } from "@/lib/abis";
import { formatEther, formatUnits, parseEther, parseUnits } from "viem";

interface ActionsPanelProps {
  crate: Crate;
}

export function ActionsPanel({ crate }: ActionsPanelProps) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: switchPending } = useSwitchChain();
  const { data: ethBalance } = useBalance({ address });
  const [amount, setAmount] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>(crate.category === "exposure" ? "mint" : "deposit");

  const crateAddress = crate.contractAddress as `0x${string}`;
  const hasAddress = !!crateAddress && crateAddress !== "0x0000000000000000000000000000000000000000";
  const onHorizen = chainId === CHAIN_IDS.HORIZEN_L3;
  const isMintTab = activeTab === "mint" || activeTab === "deposit";
  const isBurnTab = !isMintTab;

  const { data: crateEthBalance } = useBalance({
    address: crateAddress,
    chainId: CHAIN_IDS.HORIZEN_L3,
    query: { enabled: hasAddress },
  });

  const { data: tokenDecimals } = useReadContract({
    address: crateAddress,
    abi: ethCollateralCrateAbi,
    functionName: "decimals",
    query: { enabled: hasAddress },
  });

  const { data: tokenBalance } = useReadContract({
    address: crateAddress,
    abi: ethCollateralCrateAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: hasAddress && !!address },
  });

  const amountWei = useMemo(() => {
    if (!amount) return 0n;
    try {
      return parseEther(amount);
    } catch {
      return 0n;
    }
  }, [amount]);

  const tokenAmount = useMemo(() => {
    if (!amount) return 0n;
    try {
      return parseUnits(amount, tokenDecimals ?? 18);
    } catch {
      return 0n;
    }
  }, [amount, tokenDecimals]);

  const { data: previewMint } = useReadContract({
    address: crateAddress,
    abi: ethCollateralCrateAbi,
    functionName: "previewMint",
    args: address ? [address, amountWei] : undefined,
    query: { enabled: hasAddress && !!address && isMintTab && amountWei > 0n },
  });

  const { data: previewBurn } = useReadContract({
    address: crateAddress,
    abi: ethCollateralCrateAbi,
    functionName: "previewBurn",
    args: address ? [address, tokenAmount] : undefined,
    query: { enabled: hasAddress && !!address && !isMintTab && tokenAmount > 0n },
  });

  const { data: previewBurnFull } = useReadContract({
    address: crateAddress,
    abi: ethCollateralCrateAbi,
    functionName: "previewBurn",
    args: address && tokenBalance ? [address, tokenBalance] : undefined,
    query: { enabled: hasAddress && !!address && !!tokenBalance && tokenBalance > 0n },
  });

  const { data: latestPrice } = useReadContract({
    address: crateAddress,
    abi: ethCollateralCrateAbi,
    functionName: "latestPrice",
    query: { enabled: hasAddress },
  });

  const { data: latestEthPrice } = useReadContract({
    address: crateAddress,
    abi: ethCollateralCrateAbi,
    functionName: "latestEthPrice",
    query: { enabled: hasAddress },
  });

  const { data: priceMaxAge } = useReadContract({
    address: crateAddress,
    abi: ethCollateralCrateAbi,
    functionName: "priceMaxAge",
    query: { enabled: hasAddress },
  });

  const { data: ethPriceMaxAge } = useReadContract({
    address: crateAddress,
    abi: ethCollateralCrateAbi,
    functionName: "ethPriceMaxAge",
    query: { enabled: hasAddress },
  });

  const priceTimestamp = latestPrice ? Number(latestPrice[1]) : null;
  const ethPriceTimestamp = latestEthPrice ? Number(latestEthPrice[1]) : null;
  const lastUpdated =
    priceTimestamp && ethPriceTimestamp
      ? Math.min(priceTimestamp, ethPriceTimestamp)
      : priceTimestamp ?? ethPriceTimestamp ?? null;

  const nowSec = Math.floor(Date.now() / 1000);
  const priceStale =
    priceTimestamp && priceMaxAge && priceMaxAge > 0n
      ? nowSec - priceTimestamp > Number(priceMaxAge)
      : false;
  const ethStale =
    ethPriceTimestamp && ethPriceMaxAge && ethPriceMaxAge > 0n
      ? nowSec - ethPriceTimestamp > Number(ethPriceMaxAge)
      : false;

  const priceSource = priceStale || ethStale ? "Cached" : "Oracle";

  const formatAge = (seconds: number) => {
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const lastUpdatedLabel =
    lastUpdated && lastUpdated > 0 ? formatAge(Math.max(0, nowSec - lastUpdated)) : "—";
  const { writeContractAsync, data: txHash, isPending: isWritePending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash });

  const formatTokenAmount = (value: bigint, digits = 6) => {
    const formatted = formatUnits(value, tokenDecimals ?? 18);
    if (!formatted.includes(".")) return formatted;
    const [whole, fraction] = formatted.split(".");
    return `${whole}.${fraction.slice(0, digits)}`;
  };

  const crateEthAvailable = crateEthBalance?.value ?? 0n;
  const hasCrateEthBalance = !!crateEthBalance;
  const grossEthForInput = previewBurn ? previewBurn[0] + previewBurn[1] : 0n;
  const grossEthForFull = previewBurnFull ? previewBurnFull[0] + previewBurnFull[1] : 0n;
  const maxBurnTokens = useMemo(() => {
    if (!tokenBalance || tokenBalance === 0n) return 0n;
    if (grossEthForFull === 0n) return 0n;
    if (crateEthAvailable >= grossEthForFull) return tokenBalance;
    return (tokenBalance * crateEthAvailable) / grossEthForFull;
  }, [tokenBalance, grossEthForFull, crateEthAvailable]);

  const liquidityLimited =
    isBurnTab && hasCrateEthBalance && grossEthForInput > 0n && crateEthAvailable < grossEthForInput;
  const fullBurnLimited =
    isBurnTab &&
    hasCrateEthBalance &&
    tokenBalance &&
    tokenBalance > 0n &&
    grossEthForFull > 0n &&
    crateEthAvailable < grossEthForFull;

  const handleAction = (action: string) => {
    setPendingAction(action);
    setConfirmOpen(true);
  };

  const confirmAction = async () => {
    if (!hasAddress) return;
    try {
      if (!onHorizen) {
        toast.error("Switch to Horizen L3 to continue.");
        return;
      }

      if (isMintTab) {
        if (amountWei <= 0n) return;
        const hash = await writeContractAsync({
          address: crateAddress,
          abi: ethCollateralCrateAbi,
          functionName: "mint",
          value: amountWei,
        });
        toast.success(`Mint submitted: ${hash.slice(0, 10)}...`);
      } else {
        if (tokenAmount <= 0n) return;
        const hash = await writeContractAsync({
          address: crateAddress,
          abi: ethCollateralCrateAbi,
          functionName: "burn",
          args: [tokenAmount],
        });
        toast.success(`Burn submitted: ${hash.slice(0, 10)}...`);
      }

      setConfirmOpen(false);
      setAmount("");
    } catch (error) {
      toast.error("Transaction failed. Please try again.");
    }
  };

  if (!isConnected) {
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
          <WalletButton />
        </div>
      </div>
    );
  }

  if (!hasAddress) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="rounded-md bg-muted p-4 text-sm text-muted-foreground">
          Crate contract is not deployed yet.
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
          <p className="text-sm font-mono text-foreground">{address}</p>
        </div>
      </div>

      <div className="mb-4 rounded-md bg-muted p-3">
        <p className="text-xs text-muted-foreground">Wallet Balance</p>
        <p className="text-sm font-medium text-foreground">
          {ethBalance ? `${Number(ethBalance.formatted).toFixed(4)} ${ethBalance.symbol}` : "—"}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">{crate.ticker} Balance</p>
        <p className="text-sm font-medium text-foreground">
          {tokenBalance ? Number(formatUnits(tokenBalance, tokenDecimals ?? 18)).toFixed(4) : "0.0000"}
        </p>
      </div>

      {!onHorizen && (
        <Button
          onClick={() => switchChain({ chainId: CHAIN_IDS.HORIZEN_L3 })}
          disabled={switchPending}
          className="mb-4 w-full bg-zen-teal text-background hover:bg-zen-teal/90"
        >
          Switch to Horizen L3
        </Button>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full bg-muted">
          {crate.category === "exposure" ? (
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

        {(crate.category === "exposure" ? ["mint", "burn"] : ["deposit", "withdraw"]).map(
          (action) => (
            <TabsContent key={action} value={action} className="mt-4">
              <div className="flex flex-col gap-4">
                <div>
                  <Label htmlFor={`${action}-amount`} className="text-foreground text-sm">
                    {action === "burn" || action === "withdraw"
                      ? `Amount (${crate.ticker})`
                      : "Amount (ETH)"}
                  </Label>
                  <div className="mt-1.5 flex gap-2">
                    <Input
                      id={`${action}-amount`}
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-muted border-border text-foreground font-mono"
                    />
                    {(action === "burn" || action === "withdraw") && (
                      <Button
                        type="button"
                        variant="outline"
                        className="border-border text-foreground"
                        disabled={maxBurnTokens === 0n}
                        onClick={() => setAmount(formatTokenAmount(maxBurnTokens))}
                      >
                        Max burn
                      </Button>
                    )}
                  </div>
                  {(action === "burn" || action === "withdraw") && fullBurnLimited && (
                    <div className="mt-2 rounded-md border border-border bg-muted p-3 text-xs text-muted-foreground">
                      Vault liquidity is limited right now. Use Max burn to withdraw what is currently available. The
                      rest of your liquidity will be withdrawable after liquidity rebalancing.
                    </div>
                  )}
                </div>

                <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
                  ETH collateral only for now. USDC collateral support is planned
                  once native USDC is available on Horizen L3.
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
                  {isMintTab ? (
                    <div className="flex justify-between">
                      <span>Estimated {crate.ticker} minted</span>
                      <span className="font-mono text-foreground">
                        {previewMint ? Number(formatUnits(previewMint[0], tokenDecimals ?? 18)).toFixed(4) : "0.0000"}
                      </span>
                    </div>
                  ) : (
                    <div className="flex justify-between">
                      <span>Estimated ETH out</span>
                      <span className="font-mono text-foreground">
                        {previewBurn ? Number(formatEther(previewBurn[0])).toFixed(6) : "0.000000"}
                      </span>
                    </div>
                  )}
                  {isBurnTab && (
                    <div className="flex justify-between">
                      <span>Available burn liquidity</span>
                      <span className="font-mono text-foreground">
                        {crateEthBalance ? Number(crateEthBalance.formatted).toFixed(6) : "0.000000"} ETH
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Price source</span>
                    <span className="font-mono text-foreground">{priceSource}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last updated</span>
                    <span className="font-mono text-foreground">{lastUpdatedLabel}</span>
                  </div>
                </div>

                <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => handleAction(action)}
                      disabled={
                        !amount ||
                        Number(amount) <= 0 ||
                        !onHorizen ||
                        isWritePending ||
                        isConfirming ||
                        liquidityLimited
                      }
                      className="w-full bg-zen-teal text-background hover:bg-zen-teal/90 capitalize"
                    >
                      {isWritePending || isConfirming ? "Processing…" : action}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card border-border">
                    <DialogHeader>
                      <DialogTitle className="text-foreground capitalize">
                        Confirm {pendingAction}
                      </DialogTitle>
                      <DialogDescription className="text-muted-foreground">
                        You are about to {pendingAction} {amount}{" "}
                        {action === "burn" || action === "withdraw" ? crate.ticker : "ETH"} in {crate.name}.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
                      <div className="flex gap-2">
                        <AlertTriangle className="h-4 w-4 shrink-0 text-destructive mt-0.5" />
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Risk disclosure: Synthetic tokens carry smart contract
                          risk, oracle risk, and market risk. The value of
                          synthetic positions can go to zero. This is not
                          financial advice.
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
