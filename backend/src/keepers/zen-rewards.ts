import "dotenv/config";
import { ethers } from "ethers";

const rpcUrl = process.env.ZEN_REWARD_RPC_URL || process.env.HORIZEN_L3_RPC_URL || "";
const privateKey = process.env.ZEN_REWARD_PRIVATE_KEY || "";
const poolAddress =
  process.env.ZEN_STAKING_ADDRESS ||
  process.env.ZEN_STAKING_POOL_ADDRESS ||
  "";
const dailyCratesInput = process.env.ZEN_REWARD_DAILY_CRATES || "";
const perZenDailyInput = process.env.ZEN_REWARD_PER_ZEN_DAILY || "";
const duration = Number(process.env.ZEN_REWARD_DURATION_SECS || 86400);
const buffer = Number(process.env.ZEN_REWARD_BUFFER_SECS || 300);
const tokenDecimals = Number(process.env.ZEN_REWARD_TOKEN_DECIMALS || 18);
const force = (process.env.ZEN_REWARD_FORCE || "false") === "true";
const updateDuration = (process.env.ZEN_REWARD_UPDATE_DURATION || "false") === "true";

if (!rpcUrl || !privateKey || !poolAddress || (!dailyCratesInput && !perZenDailyInput)) {
  throw new Error(
    "Missing ZEN_REWARD_RPC_URL (or HORIZEN_L3_RPC_URL), ZEN_REWARD_PRIVATE_KEY, ZEN_STAKING_ADDRESS, and either ZEN_REWARD_DAILY_CRATES or ZEN_REWARD_PER_ZEN_DAILY."
  );
}

const provider = new ethers.JsonRpcProvider(rpcUrl);
const wallet = new ethers.Wallet(privateKey, provider);

const poolAbi = [
  "function notifyRewardAmount(uint256 reward)",
  "function setRewardsDuration(uint256 duration)",
  "function periodFinish() view returns (uint256)",
  "function rewardsDuration() view returns (uint256)",
  "function rewardRate() view returns (uint256)",
  "function rewardReserve() view returns (uint256)",
  "function crates() view returns (address)",
  "function totalZenStaked() view returns (uint256)"
];

const erc20Abi = ["function balanceOf(address) view returns (uint256)"];

async function main() {
  const pool = new ethers.Contract(poolAddress, poolAbi, wallet);
  const [periodFinish, rewardsDuration, rewardReserve, cratesAddress, totalZenStaked] = await Promise.all([
    pool.periodFinish(),
    pool.rewardsDuration(),
    pool.rewardReserve(),
    pool.crates(),
    pool.totalZenStaked()
  ]);

  const now = Math.floor(Date.now() / 1000);
  if (!force && Number(periodFinish) > now + buffer) {
    console.log(`Rewards active until ${Number(periodFinish)}. Skipping.`);
    return;
  }

  if (updateDuration && Number(periodFinish) <= now && Number(rewardsDuration) !== duration) {
    const updateTx = await pool.setRewardsDuration(duration);
    await updateTx.wait();
  }

  let dailyAmount = 0n;
  if (perZenDailyInput) {
    if (totalZenStaked === 0n) {
      console.log("No ZEN staked yet. Skipping rewards.");
      return;
    }
    const perZenDaily = ethers.parseUnits(perZenDailyInput, tokenDecimals);
    dailyAmount = (totalZenStaked * perZenDaily) / ethers.parseUnits("1", tokenDecimals);
  } else {
    dailyAmount = ethers.parseUnits(dailyCratesInput, tokenDecimals);
  }

  if (dailyAmount === 0n) {
    throw new Error("Daily reward amount resolved to 0.");
  }

  const crates = new ethers.Contract(cratesAddress, erc20Abi, provider);
  const balance = await crates.balanceOf(poolAddress);
  const required = rewardReserve + dailyAmount;
  if (balance < required) {
    throw new Error(
      `Insufficient CRATES in pool. Balance ${balance.toString()} < required ${required.toString()}.`
    );
  }

  const tx = await pool.notifyRewardAmount(dailyAmount);
  const receipt = await tx.wait();
  console.log("Rewards funded:", {
    tx: receipt?.hash,
    dailyAmount: dailyAmount.toString(),
    duration
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
