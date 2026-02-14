"use client";

import { useMemo, useState } from "react";
import { useAccount, useChainId, useReadContract, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WalletButton } from "@/components/wallet-button";
import { toast } from "sonner";
import { CHAIN_IDS, L3_ADDRESSES } from "@/lib/addresses";
import { erc20Abi, zenStakingAbi } from "@/lib/abis";
import { cn } from "@/lib/utils";

const MODES = [
  { id: "stake", label: "Stake ZEN" },
  { id: "unstake", label: "Unstake ZEN" },
] as const;

export function ZenStakingModule() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: switchPending } = useSwitchChain();
  const { writeContractAsync, data: txHash, isPending: isWritePending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash });

  const [mode, setMode] = useState<(typeof MODES)[number]["id"]>("stake");
  const [amount, setAmount] = useState("");

  const zenToken = L3_ADDRESSES?.zenToken as `0x${string}` | undefined;
  const zenStaking = L3_ADDRESSES?.zenStaking as `0x${string}` | undefined;
  const cratesToken = L3_ADDRESSES?.cratesToken as `0x${string}` | undefined;

  const onHorizen = chainId === CHAIN_IDS.HORIZEN_L3;

  const { data: zenDecimals } = useReadContract({
    address: zenToken,
    abi: erc20Abi,
    functionName: "decimals",
    query: { enabled: !!zenToken },
  });

  const { data: cratesDecimals } = useReadContract({
    address: cratesToken,
    abi: erc20Abi,
    functionName: "decimals",
    query: { enabled: !!cratesToken },
  });

  const { data: zenBalance } = useReadContract({
    address: zenToken,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!zenToken && !!address },
  });

  const { data: cratesBalance } = useReadContract({
    address: cratesToken,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!cratesToken && !!address },
  });

  const { data: stakedZen } = useReadContract({
    address: zenStaking,
    abi: zenStakingAbi,
    functionName: "stakedBalanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!zenStaking && !!address },
  });

  const { data: cratesDebt } = useReadContract({
    address: zenStaking,
    abi: zenStakingAbi,
    functionName: "cratesDebtOf",
    args: address ? [address] : undefined,
    query: { enabled: !!zenStaking && !!address },
  });

  const { data: claimable } = useReadContract({
    address: zenStaking,
    abi: zenStakingAbi,
    functionName: "earned",
    args: address ? [address] : undefined,
    query: { enabled: !!zenStaking && !!address },
  });

  const { data: cratesPerZen } = useReadContract({
    address: zenStaking,
    abi: zenStakingAbi,
    functionName: "cratesPerZen",
    query: { enabled: !!zenStaking },
  });

  const { data: rewardRate } = useReadContract({
    address: zenStaking,
    abi: zenStakingAbi,
    functionName: "rewardRate",
    query: { enabled: !!zenStaking },
  });

  const { data: rewardsDuration } = useReadContract({
    address: zenStaking,
    abi: zenStakingAbi,
    functionName: "rewardsDuration",
    query: { enabled: !!zenStaking },
  });

  const { data: periodFinish } = useReadContract({
    address: zenStaking,
    abi: zenStakingAbi,
    functionName: "periodFinish",
    query: { enabled: !!zenStaking },
  });

  const { data: unstakeFeeBps } = useReadContract({
    address: zenStaking,
    abi: zenStakingAbi,
    functionName: "unstakeFeeBps",
    query: { enabled: !!zenStaking },
  });

  const amountWei = useMemo(() => {
    if (!amount) return 0n;
    try {
      return parseUnits(amount, zenDecimals ?? 18);
    } catch {
      return 0n;
    }
  }, [amount, zenDecimals]);

  const { data: zenAllowance } = useReadContract({
    address: zenToken,
    abi: erc20Abi,
    functionName: "allowance",
    args: address && zenStaking ? [address, zenStaking] : undefined,
    query: { enabled: !!zenToken && !!zenStaking && !!address },
  });

  const { data: cratesAllowance } = useReadContract({
    address: cratesToken,
    abi: erc20Abi,
    functionName: "allowance",
    args: address && zenStaking ? [address, zenStaking] : undefined,
    query: { enabled: !!cratesToken && !!zenStaking && !!address },
  });

  const { data: cratesOut } = useReadContract({
    address: zenStaking,
    abi: zenStakingAbi,
    functionName: "quoteCrates",
    args: [amountWei],
    query: { enabled: !!zenStaking && amountWei > 0n },
  });

  const { data: cratesRequired } = useReadContract({
    address: zenStaking,
    abi: zenStakingAbi,
    functionName: "quoteCratesForUnstake",
    args: address ? [address, amountWei] : undefined,
    query: { enabled: !!zenStaking && !!address && amountWei > 0n },
  });

  const feeAmount = useMemo(() => {
    if (!unstakeFeeBps || amountWei === 0n) return 0n;
    return (amountWei * BigInt(unstakeFeeBps)) / 10_000n;
  }, [unstakeFeeBps, amountWei]);

  const dailyIncentive = useMemo(() => {
    if (!rewardRate) return 0n;
    return rewardRate * 86_400n;
  }, [rewardRate]);

  const needsApproval =
    mode === "stake"
      ? amountWei > 0n && (zenAllowance ?? 0n) < amountWei
      : amountWei > 0n && (cratesAllowance ?? 0n) < (cratesRequired ?? 0n);

  const stakedZenAmount = stakedZen ?? 0n;
  const exceedsStaked = mode === "unstake" && amountWei > 0n && amountWei > stakedZenAmount;

  const handleApprove = async () => {
    if (!onHorizen) {
      toast.error("Switch to Horizen L3 to continue.");
      return;
    }
    if (!zenStaking) return;
    try {
      if (mode === "stake") {
        if (!zenToken) return;
        const hash = await writeContractAsync({
          address: zenToken,
          abi: erc20Abi,
          functionName: "approve",
          args: [zenStaking, amountWei],
        });
        toast.success(`Approval submitted: ${hash.slice(0, 10)}...`);
      } else {
        if (!cratesToken) return;
        const approveAmount = cratesRequired ?? 0n;
        const hash = await writeContractAsync({
          address: cratesToken,
          abi: erc20Abi,
          functionName: "approve",
          args: [zenStaking, approveAmount],
        });
        toast.success(`Approval submitted: ${hash.slice(0, 10)}...`);
      }
    } catch {
      toast.error("Approval failed. Please try again.");
    }
  };

  const handleSubmit = async () => {
    if (!zenStaking) return;
    if (!onHorizen) {
      toast.error("Switch to Horizen L3 to continue.");
      return;
    }
    if (amountWei <= 0n) return;
    try {
      const hash = await writeContractAsync({
        address: zenStaking,
        abi: zenStakingAbi,
        functionName: mode === "stake" ? "stake" : "unstake",
        args: [amountWei],
      });
      toast.success(`${mode === "stake" ? "Stake" : "Unstake"} submitted: ${hash.slice(0, 10)}...`);
      setAmount("");
    } catch {
      toast.error("Transaction failed. Please try again.");
    }
  };

  const handleClaim = async () => {
    if (!zenStaking) return;
    if (!onHorizen) {
      toast.error("Switch to Horizen L3 to continue.");
      return;
    }
    try {
      const hash = await writeContractAsync({
        address: zenStaking,
        abi: zenStakingAbi,
        functionName: "claimRewards",
      });
      toast.success(`Claim submitted: ${hash.slice(0, 10)}...`);
    } catch {
      toast.error("Claim failed. Please try again.");
    }
  };

  if (!isConnected) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Connect your wallet to stake ZEN and receive CRATES.
          </p>
          <WalletButton />
        </div>
      </div>
    );
  }

  if (!zenToken || !zenStaking || zenStaking === "0x0000000000000000000000000000000000000000") {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          ZEN staking is not configured yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">ZEN Staking Pool</h3>
          <p className="text-xs text-muted-foreground">
            Stake ZEN to receive CRATES at the fixed pool rate. Unstaking returns ZEN
            and requires returning CRATES.
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

      <div className="mb-4 grid grid-cols-2 gap-2">
        {MODES.map((item) => (
          <button
            key={item.id}
            onClick={() => setMode(item.id)}
            className={cn(
              "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
              mode === item.id
                ? "border-zen-teal bg-zen-teal/10 text-zen-teal"
                : "border-border bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="zen-amount" className="text-sm text-foreground">
            Amount (ZEN)
          </Label>
          <Input
            id="zen-amount"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="mt-1.5 bg-muted border-border text-foreground font-mono"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Wallet balance:{" "}
            {zenBalance ? Number(formatUnits(zenBalance, zenDecimals ?? 18)).toFixed(4) : "0.0000"} ZEN
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            CRATES balance:{" "}
            {cratesBalance ? Number(formatUnits(cratesBalance, cratesDecimals ?? 18)).toFixed(4) : "0.0000"} CRATES
          </p>
        </div>

        <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Current pool rate</span>
            <span className="font-mono text-foreground">
              {cratesPerZen ? `${Number(formatUnits(cratesPerZen, 18)).toLocaleString()} CRATES / ZEN` : "Loading..."}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span>Staked ZEN</span>
            <span className="font-mono text-foreground">
              {stakedZen ? Number(formatUnits(stakedZen, zenDecimals ?? 18)).toFixed(4) : "0.0000"}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span>CRATES required to redeem</span>
            <span className="font-mono text-foreground">
              {cratesDebt ? Number(formatUnits(cratesDebt, cratesDecimals ?? 18)).toFixed(4) : "0.0000"}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span>Claimable incentives</span>
            <span className="font-mono text-foreground">
              {claimable ? Number(formatUnits(claimable, cratesDecimals ?? 18)).toFixed(4) : "0.0000"} CRATES
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span>Daily incentive rate</span>
            <span className="font-mono text-foreground">
              {dailyIncentive ? Number(formatUnits(dailyIncentive, cratesDecimals ?? 18)).toFixed(2) : "0.00"} CRATES
            </span>
          </div>
          {periodFinish ? (
            <div className="mt-1 flex items-center justify-between">
              <span>Program ends</span>
              <span className="font-mono text-foreground">
                {new Date(Number(periodFinish) * 1000).toLocaleDateString()}
              </span>
            </div>
          ) : null}
        </div>

        {mode === "stake" ? (
          <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Estimated CRATES out</span>
              <span className="font-mono text-foreground">
                {cratesOut ? Number(formatUnits(cratesOut, cratesDecimals ?? 18)).toFixed(4) : "0.0000"}
              </span>
            </div>
          </div>
        ) : (
          <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>CRATES to return</span>
              <span className="font-mono text-foreground">
                {cratesRequired ? Number(formatUnits(cratesRequired, cratesDecimals ?? 18)).toFixed(4) : "0.0000"}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span>Unstake fee</span>
              <span className="font-mono text-foreground">
                {feeAmount ? Number(formatUnits(feeAmount, zenDecimals ?? 18)).toFixed(4) : "0.0000"} ZEN
              </span>
            </div>
          </div>
        )}

        {needsApproval ? (
          <Button
            onClick={handleApprove}
            disabled={!onHorizen || isWritePending || isConfirming || amountWei <= 0n || exceedsStaked}
            className="w-full bg-zen-teal text-background hover:bg-zen-teal/90"
          >
            {isWritePending || isConfirming
              ? "Approving..."
              : mode === "stake"
                ? "Approve ZEN"
                : "Approve CRATES"}
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!onHorizen || isWritePending || isConfirming || amountWei <= 0n || exceedsStaked}
            className="w-full bg-zen-teal text-background hover:bg-zen-teal/90"
          >
            {isWritePending || isConfirming
              ? "Processing..."
              : mode === "stake"
                ? "Stake ZEN"
                : "Unstake ZEN"}
          </Button>
        )}

        <Button
          onClick={handleClaim}
          disabled={!onHorizen || isWritePending || isConfirming || !claimable || claimable === 0n}
          variant="outline"
          className="w-full border-border text-foreground"
        >
          {isWritePending || isConfirming ? "Claiming..." : "Claim Incentives"}
        </Button>

        <div className="rounded-md bg-muted/60 p-3 text-xs text-muted-foreground">
          ZEN staking uses a fixed pool rate. Unstaking returns your ZEN minus a
          {unstakeFeeBps ? ` ${unstakeFeeBps} bps` : " 200 bps"} fee and requires
          returning CRATES. Incentives accrue over time and are claimable when
          available. This is a utility flow and does not provide dividends or
          guaranteed results.
        </div>
        {exceedsStaked && (
          <p className="text-xs text-destructive">
            Amount exceeds your staked ZEN balance.
          </p>
        )}
      </div>
    </div>
  );
}
