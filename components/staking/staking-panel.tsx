"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useAccount,
  useChainId,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { StakingSummary, TokenMeta } from "@/lib/types";
import { CHAIN_IDS } from "@/lib/addresses";
import { erc20Abi, stakingAbi } from "@/lib/abis";
import { WalletButton } from "@/components/wallet-button";

export function StakingPanel() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: switchPending } = useSwitchChain();
  const queryClient = useQueryClient();

  const [amount, setAmount] = useState("");
  const [lockDays, setLockDays] = useState("");
  const [selectedPositionId, setSelectedPositionId] = useState<string | null>(null);

  const { data: token } = useQuery<TokenMeta>({
    queryKey: ["token"],
    queryFn: () => fetch("/api/token").then((r) => r.json()),
  });

  const { data: stakingSummary } = useQuery<StakingSummary>({
    queryKey: ["staking", address],
    queryFn: () => fetch(`/api/staking?wallet=${address}`).then((r) => r.json()),
    enabled: isConnected && !!address,
  });

  const stakingAddress = token?.staking?.contractAddress as `0x${string}` | undefined;
  const cratesAddress = token?.chains?.horizenL3?.address as `0x${string}` | undefined;
  const onHorizen = chainId === CHAIN_IDS.HORIZEN_L3;

  useEffect(() => {
    if (!selectedPositionId && stakingSummary) {
      setSelectedPositionId(stakingSummary.lastPositionId ?? "0");
    }
  }, [selectedPositionId, stakingSummary]);

  const effectivePositionId = selectedPositionId ?? "0";

  const { data: tokenDecimals } = useReadContract({
    address: cratesAddress,
    abi: erc20Abi,
    functionName: "decimals",
    query: { enabled: !!cratesAddress },
  });

  const { data: cratesBalance } = useReadContract({
    address: cratesAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!cratesAddress && !!address },
  });

  const { data: allowance } = useReadContract({
    address: cratesAddress,
    abi: erc20Abi,
    functionName: "allowance",
    args: address && stakingAddress ? [address, stakingAddress] : undefined,
    query: { enabled: !!cratesAddress && !!stakingAddress && !!address },
  });

  const amountWei = useMemo(() => {
    if (!amount) return 0n;
    try {
      return parseUnits(amount, tokenDecimals ?? 18);
    } catch {
      return 0n;
    }
  }, [amount, tokenDecimals]);

  const lockDuration = useMemo(() => {
    if (!lockDays) return 0n;
    const parsed = Number(lockDays);
    if (!Number.isFinite(parsed) || parsed <= 0) return 0n;
    return BigInt(Math.floor(parsed * 86400));
  }, [lockDays]);

  const needsApproval = amountWei > 0n && (allowance ?? 0n) < amountWei;

  const { writeContractAsync, data: txHash, isPending: isWritePending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash });

  const handleApprove = async () => {
    if (!cratesAddress || !stakingAddress) return;
    if (!onHorizen) {
      toast.error("Switch to Horizen L3 to continue.");
      return;
    }
    try {
      const hash = await writeContractAsync({
        address: cratesAddress,
        abi: erc20Abi,
        functionName: "approve",
        args: [stakingAddress, amountWei],
      });
      toast.success(`Approval submitted: ${hash.slice(0, 10)}...`);
    } catch {
      toast.error("Approval failed. Please try again.");
    }
  };

  const handleStake = async () => {
    if (!stakingAddress) return;
    if (!onHorizen) {
      toast.error("Switch to Horizen L3 to continue.");
      return;
    }
    if (amountWei <= 0n) return;
    try {
      const hash = await writeContractAsync({
        address: stakingAddress,
        abi: stakingAbi,
        functionName: "stake",
        args: [amountWei, lockDuration, BigInt(effectivePositionId)],
      });
      toast.success(`Stake submitted: ${hash.slice(0, 10)}...`);
      setAmount("");
      queryClient.invalidateQueries({ queryKey: ["staking", address] });
      queryClient.invalidateQueries({ queryKey: ["rewards", address] });
    } catch {
      toast.error("Stake failed. Please try again.");
    }
  };

  const handleUnstake = async (positionId: string) => {
    if (!stakingAddress) return;
    if (!onHorizen) {
      toast.error("Switch to Horizen L3 to continue.");
      return;
    }
    try {
      const hash = await writeContractAsync({
        address: stakingAddress,
        abi: stakingAbi,
        functionName: "unstake",
        args: [BigInt(positionId)],
      });
      toast.success(`Unstake submitted: ${hash.slice(0, 10)}...`);
      queryClient.invalidateQueries({ queryKey: ["staking", address] });
      queryClient.invalidateQueries({ queryKey: ["rewards", address] });
    } catch {
      toast.error("Unstake failed. Please try again.");
    }
  };

  if (!isConnected) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Connect your wallet to stake CRATES and view sCRATES positions.
          </p>
          <WalletButton />
        </div>
      </div>
    );
  }

  if (!stakingAddress || !cratesAddress) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Staking is not configured yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">Stake CRATES</h3>
          <p className="text-xs text-muted-foreground">
            Staking grants fee rebate eligibility and governance voting power.
          </p>
        </div>
        {!onHorizen && (
          <Button
            onClick={() => switchChain({ chainId: CHAIN_IDS.HORIZEN_L3 })}
            disabled={switchPending}
            className="bg-zen-teal text-background hover:bg-zen-teal/90"
          >
            Switch to Horizen L3
          </Button>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div>
            <Label htmlFor="stake-amount" className="text-sm text-foreground">
              Amount (CRATES)
            </Label>
            <Input
              id="stake-amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1.5 bg-muted border-border text-foreground font-mono"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Wallet balance:{" "}
              {cratesBalance ? Number(formatUnits(cratesBalance, tokenDecimals ?? 18)).toFixed(4) : "0.0000"} CRATES
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-sm text-foreground">Position</Label>
              <Select
                value={effectivePositionId}
                onValueChange={(value) => setSelectedPositionId(value)}
              >
                <SelectTrigger className="mt-1.5 bg-muted border-border text-foreground">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">New position</SelectItem>
                  {stakingSummary?.positions.map((pos) => (
                    <SelectItem key={pos.positionId} value={pos.positionId}>
                      Position #{pos.positionId} · {pos.amount.toFixed(4)} CRATES
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1 text-xs text-muted-foreground">
                Default is your latest position.
              </p>
            </div>

            <div>
              <Label htmlFor="lock-days" className="text-sm text-foreground">
                Optional Lock (days)
              </Label>
              <Input
                id="lock-days"
                type="number"
                placeholder="0"
                value={lockDays}
                onChange={(e) => setLockDays(e.target.value)}
                className="mt-1.5 bg-muted border-border text-foreground font-mono"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                0 = no lock. Longer lock extends the position lock.
              </p>
            </div>
          </div>

          {needsApproval ? (
            <Button
              onClick={handleApprove}
              disabled={!onHorizen || isWritePending || isConfirming || amountWei <= 0n}
              className="w-full bg-zen-teal text-background hover:bg-zen-teal/90"
            >
              {isWritePending || isConfirming ? "Approving..." : "Approve CRATES"}
            </Button>
          ) : (
            <Button
              onClick={handleStake}
              disabled={!onHorizen || isWritePending || isConfirming || amountWei <= 0n}
              className="w-full bg-zen-teal text-background hover:bg-zen-teal/90"
            >
              {isWritePending || isConfirming ? "Staking..." : "Stake CRATES"}
            </Button>
          )}
        </div>

        <div className="rounded-md bg-muted/60 p-4 text-xs text-muted-foreground">
          <p className="font-medium text-foreground mb-2">How it works</p>
          <p>
            Staking mints an sCRATES position NFT that represents your staked
            balance. Ownership determines fee rebate eligibility and voting
            power. Staking does not provide dividends or guaranteed results.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-foreground">sCRATES Positions</h4>
          <span className="text-xs text-muted-foreground">
            Staked balance: {stakingSummary ? stakingSummary.stakedBalance.toFixed(4) : "0.0000"} CRATES
          </span>
        </div>

        <div className="mt-3 overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Position</th>
                <th className="px-3 py-2 text-right font-medium">Amount</th>
                <th className="px-3 py-2 text-right font-medium">Lock</th>
                <th className="px-3 py-2 text-right font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {stakingSummary?.positions.length ? (
                stakingSummary.positions.map((pos) => (
                  <tr key={pos.positionId} className="border-t border-border">
                    <td className="px-3 py-2 text-foreground">#{pos.positionId}</td>
                    <td className="px-3 py-2 text-right font-mono text-foreground">
                      {pos.amount.toFixed(4)}
                    </td>
                    <td className="px-3 py-2 text-right text-muted-foreground">
                      {pos.isLocked ? "Locked" : "Unlocked"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!onHorizen || pos.isLocked || isWritePending || isConfirming}
                        onClick={() => handleUnstake(pos.positionId)}
                        className="border-border text-foreground"
                      >
                        Unstake
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-3 py-3 text-sm text-muted-foreground" colSpan={4}>
                    No active positions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
