"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAccount, useChainId, useReadContract, useSwitchChain, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatEther, formatUnits, parseEther, parseUnits } from "viem";
import { cratesPresaleAbi } from "@/lib/abis";
import { CHAIN_IDS, L3_ADDRESSES } from "@/lib/addresses";
import { WalletButton } from "@/components/wallet-button";
import { toast } from "sonner";

const NETWORKS = [
  { id: "horizen-l3", label: "Horizen L3", tag: "Primary" },
  { id: "base", label: "Base", tag: "Bridged" },
] as const;

export function BuyModule() {
  const [selectedNetwork, setSelectedNetwork] = useState<string>("horizen-l3");
  const [amountEth, setAmountEth] = useState<string>("");
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: switchPending } = useSwitchChain();
  const { writeContractAsync, data: txHash, isPending: isWritePending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash });

  const presaleAddress = L3_ADDRESSES?.presale;
  const hasPresale = !!presaleAddress && presaleAddress !== "0x0000000000000000000000000000000000000000";

  const { data: cratesPerEth } = useReadContract({
    address: presaleAddress,
    abi: cratesPresaleAbi,
    functionName: "cratesPerEth",
    query: { enabled: hasPresale },
  });

  const { data: maxEth } = useReadContract({
    address: presaleAddress,
    abi: cratesPresaleAbi,
    functionName: "maxEth",
    query: { enabled: hasPresale },
  });

  const { data: totalEthRaised } = useReadContract({
    address: presaleAddress,
    abi: cratesPresaleAbi,
    functionName: "totalEthRaised",
    query: { enabled: hasPresale },
  });

  const amountWei = useMemo(() => {
    if (!amountEth) return 0n;
    try {
      return parseEther(amountEth);
    } catch {
      return 0n;
    }
  }, [amountEth]);

  const cratesOut = useMemo(() => {
    if (!cratesPerEth || amountWei === 0n) return 0n;
    return (amountWei * cratesPerEth) / parseEther("1");
  }, [cratesPerEth, amountWei]);

  const priceForHundred = useMemo(() => {
    if (!cratesPerEth) return null;
    const hundredCrates = parseUnits("100", 18);
    const ethForHundred = (hundredCrates * parseEther("1")) / cratesPerEth;
    return formatEther(ethForHundred);
  }, [cratesPerEth]);

  const remainingEth = useMemo(() => {
    if (!maxEth || !totalEthRaised) return null;
    if (maxEth <= totalEthRaised) return 0n;
    return maxEth - totalEthRaised;
  }, [maxEth, totalEthRaised]);

  const onHorizen = chainId === CHAIN_IDS.HORIZEN_L3;
  const baseSelected = selectedNetwork === "base";
  const hasAmount = amountWei > 0n;
  const exceedsRemaining = remainingEth !== null && amountWei > remainingEth;

  const handleBuy = async () => {
    if (!presaleAddress || !hasAmount || !onHorizen) return;
    try {
      const hash = await writeContractAsync({
        address: presaleAddress,
        abi: cratesPresaleAbi,
        functionName: "buy",
        value: amountWei,
      });
      toast.success(`Purchase submitted: ${hash.slice(0, 10)}...`);
      setAmountEth("");
    } catch (error) {
      toast.error("Transaction failed. Please try again.");
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="text-foreground font-medium mb-4">Buy CRATES (Presale)</h3>

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
                <span className="ml-1 text-xs opacity-60">({network.tag})</span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Fixed price</span>
            <span className="font-mono text-foreground">
              {priceForHundred ? `100 CRATES = ${Number(priceForHundred).toFixed(4)} ETH` : "Loading…"}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span>Presale cap</span>
            <span className="font-mono text-foreground">
              {maxEth ? `${Number(formatEther(maxEth)).toFixed(2)} ETH` : "—"}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span>Raised</span>
            <span className="font-mono text-foreground">
              {totalEthRaised ? `${Number(formatEther(totalEthRaised)).toFixed(4)} ETH` : "—"}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span>Remaining</span>
            <span className="font-mono text-foreground">
              {remainingEth !== null ? `${Number(formatEther(remainingEth)).toFixed(4)} ETH` : "—"}
            </span>
          </div>
        </div>

        {baseSelected && (
          <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
            Presale purchases are only available on Horizen L3. Switch back to
            Horizen L3 to buy CRATES.
          </div>
        )}

        {!hasPresale && (
          <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
            Presale contract not deployed. Update `frontend-bridge/addresses.json`
            with the presale address to enable buying.
          </div>
        )}

        <div>
          <Label htmlFor="eth-amount" className="text-sm text-muted-foreground">
            Amount (ETH)
          </Label>
          <input
            id="eth-amount"
            type="number"
            min="0"
            step="0.0001"
            value={amountEth}
            onChange={(event) => setAmountEth(event.target.value)}
            className="mt-2 w-full rounded-md border border-border bg-muted px-3 py-2 text-sm font-mono text-foreground"
            placeholder="0.00"
          />
        </div>

        <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Estimated CRATES</span>
            <span className="font-mono text-foreground">
              {cratesOut > 0n ? Number(formatUnits(cratesOut, 18)).toLocaleString() : "0"}
            </span>
          </div>
          {exceedsRemaining && (
            <p className="mt-2 text-xs text-destructive">
              Amount exceeds remaining presale capacity.
            </p>
          )}
        </div>

        {!isConnected && !baseSelected && <WalletButton />}

        {isConnected && !onHorizen && !baseSelected && (
          <Button
            onClick={() => switchChain({ chainId: CHAIN_IDS.HORIZEN_L3 })}
            disabled={switchPending}
            className="w-full bg-zen-teal text-background hover:bg-zen-teal/90"
          >
            Switch to Horizen L3
          </Button>
        )}

        {isConnected && onHorizen && !baseSelected && (
          <Button
            onClick={handleBuy}
            disabled={!hasPresale || !hasAmount || exceedsRemaining || isWritePending || isConfirming}
            className="w-full bg-zen-teal text-background hover:bg-zen-teal/90"
          >
            {isWritePending || isConfirming ? "Processing…" : "Buy CRATES"}
          </Button>
        )}

        <div className="rounded-md bg-muted p-3">
          <div className="flex gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-chart-4 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              CRATES is a utility token that provides fee rebates on the ZenCrates
              protocol. It is not a security. Token holders receive no ownership
              rights, cash payouts, or guaranteed price changes. Rebates are
              programmatic fee discounts controlled by governance and subject to
              change.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
