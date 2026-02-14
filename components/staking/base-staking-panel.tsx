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
import type { StakingSummary } from "@/lib/types";
import { BASE_ADDRESSES, CHAIN_IDS } from "@/lib/addresses";
import { erc20Abi, stakingAbi } from "@/lib/abis";
import { WalletButton } from "@/components/wallet-button";

export function BaseStakingPanel() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: switchPending } = useSwitchChain();
  const queryClient = useQueryClient();

  const [amount, setAmount] = useState("");
  const [lockDays, setLockDays] = useState("");
  const [selectedPositionId, setSelectedPositionId] = useState<string | null>(null);

  const { data: stakingSummary } = useQuery<StakingSummary>({
    queryKey: ["base-staking", address],
    queryFn: () => fetch(`/api/base-staking?wallet=${address}`).then((r) => r.json()),
    enabled: isConnected && !!address,
  });

  const stakingAddress = BASE_ADDRESSES?.baseStaking as `0x${string}` | undefined;
  const tokenAddress = BASE_ADDRESSES?.wrappedCrates as `0x${string}` | undefined;
  const onBase = chainId === CHAIN_IDS.BASE;

  useEffect(() => {
    if (!selectedPositionId && stakingSummary) {
      setSelectedPositionId(stakingSummary.lastPositionId ?? "0");
    }
  }, [selectedPositionId, stakingSummary]);

  const effectivePositionId = selectedPositionId ?? "0";

  const { data: tokenDecimals } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "decimals",
    query: { enabled: !!tokenAddress },
  });

  const { data: balance } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!tokenAddress && !!address },
  });

  const { data: allowance } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "allowance",
    args: address && stakingAddress ? [address, stakingAddress] : undefined,
    query: { enabled: !!tokenAddress && !!stakingAddress && !!address },
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
    if (!tokenAddress || !stakingAddress) return;
    if (!onBase) {
      toast.error("Switch to Base to continue.");
      return;
    }
    try {
      const hash = await writeContractAsync({
        address: tokenAddress,
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
    if (!onBase) {
      toast.error("Switch to Base to continue.");
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
      queryClient.invalidateQueries({ queryKey: ["base-staking", address] });
    } catch {
      toast.error("Stake failed. Please try again.");
    }
  };

  const handleUnstake = async (positionId: string) => {
    if (!stakingAddress) return;
    if (!onBase) {
      toast.error("Switch to Base to continue.");
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
      queryClient.invalidateQueries({ queryKey: ["base-staking", address] });
    } catch {
      toast.error("Unstake failed. Please try again.");
    }
  };

  if (!isConnected) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Connect your wallet to stake wCRATES on Base.
          </p>
          <WalletButton />
        </div>
      </div>
    );
  }

  if (!stakingAddress || !tokenAddress || stakingAddress === "0x0000000000000000000000000000000000000000") {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Base staking is not configured yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">Stake wCRATES (Base)</h3>
          <p className="text-xs text-muted-foreground">
            Base staking is a mirror for wCRATES. It does not grant L3 governance
            voting or fee rebate eligibility.
          </p>
        </div>
        {!onBase && (
          <Button
            onClick={() => switchChain({ chainId: CHAIN_IDS.BASE })}
            disabled={switchPending}
            className="bg-zen-teal text-background hover:bg-zen-teal/90"
          >
            Switch to Base
          </Button>
        )}
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="stake-amount-base" className="text-sm text-foreground">
              Amount (wCRATES)
            </Label>
            <Input
              id="stake-amount-base"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1.5 bg-muted border-border text-foreground font-mono"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Wallet balance:{" "}
              {balance ? Number(formatUnits(balance, tokenDecimals ?? 18)).toFixed(4) : "0.0000"} wCRATES
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
                      Position #{pos.positionId} · {pos.amount.toFixed(4)} wCRATES
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1 text-xs text-muted-foreground">
                Default is your latest position.
              </p>
            </div>

            <div>
              <Label htmlFor="lock-days-base" className="text-sm text-foreground">
                Optional Lock (days)
              </Label>
              <Input
                id="lock-days-base"
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
              disabled={!onBase || isWritePending || isConfirming || amountWei <= 0n}
              className="w-full bg-zen-teal text-background hover:bg-zen-teal/90"
            >
              {isWritePending || isConfirming ? "Approving..." : "Approve wCRATES"}
            </Button>
          ) : (
            <Button
              onClick={handleStake}
              disabled={!onBase || isWritePending || isConfirming || amountWei <= 0n}
              className="w-full bg-zen-teal text-background hover:bg-zen-teal/90"
            >
              {isWritePending || isConfirming ? "Staking..." : "Stake wCRATES"}
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md bg-muted/60 p-4 text-xs text-muted-foreground">
        <p className="font-medium text-foreground mb-2">How it works</p>
        <p>
          Base staking mints a wCRATES position NFT. For L3 rebates and governance,
          stake CRATES directly on Horizen L3.
        </p>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-foreground">wCRATES Positions</h4>
          <span className="text-xs text-muted-foreground">
            Staked balance: {stakingSummary ? stakingSummary.stakedBalance.toFixed(4) : "0.0000"} wCRATES
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
                        disabled={!onBase || pos.isLocked || isWritePending || isConfirming}
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
