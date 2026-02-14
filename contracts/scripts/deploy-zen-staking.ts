import { ethers } from "hardhat";
import fs from "fs";
import path from "path";
import { writeAddresses, writeBackendTokenData } from "./utils";

const DEFAULT_CRATES_PER_ZEN = "100000";
const DEFAULT_UNSTAKE_FEE_BPS = 200;
const DEFAULT_ZEN_TOKEN = "0x57da2D504bf8b83Ef304759d9f2648522D7a9280";

async function main() {
  const [deployer] = await ethers.getSigners();

  const admin = process.env.ADMIN_ADDRESS || deployer.address;
  const cratesAddress = process.env.HORIZEN_CRATES_ADDRESS || "";
  if (!cratesAddress) {
    throw new Error("Missing HORIZEN_CRATES_ADDRESS");
  }

  const zenToken = process.env.ZEN_TOKEN_ADDRESS || DEFAULT_ZEN_TOKEN;
  const treasury = process.env.ZEN_STAKE_TREASURY || process.env.TREASURY_ADDRESS || deployer.address;
  const cratesPerZenInput =
    process.env.ZEN_STAKE_CRATES_PER_ZEN ||
    process.env.PRESALE_CRATES_PER_ETH ||
    DEFAULT_CRATES_PER_ZEN;
  const unstakeFeeBps = Number(process.env.ZEN_UNSTAKE_FEE_BPS || DEFAULT_UNSTAKE_FEE_BPS);

  const cratesPerZen = ethers.parseUnits(cratesPerZenInput, 18);

  const Pool = await ethers.getContractFactory("ZenStakingPool");
  const pool = await Pool.deploy(
    zenToken,
    cratesAddress,
    treasury,
    cratesPerZen,
    unstakeFeeBps,
    admin
  );
  await pool.waitForDeployment();

  const networkInfo = await deployer.provider!.getNetwork();
  const chainId = Number(networkInfo.chainId);
  const poolAddress = await pool.getAddress();

  writeAddresses(chainId, {
    name: "Horizen L3",
    chainId,
    zenToken,
    zenStaking: poolAddress
  });

  const explorerBase = process.env.HORIZEN_L3_EXPLORER || "";
  const baseExplorer = process.env.BASE_EXPLORER || "";
  const baseChainId = Number(process.env.BASE_CHAIN_ID || 8453);
  const baseCratesAddress = process.env.BASE_CRATES_ADDRESS || "0x0000000000000000000000000000000000000000";
  const totalSupply = process.env.CRATES_TOTAL_SUPPLY || "0";

  let existingStaking: { stakingAddress: string; sCratesAddress: string; explorerUrl: string } | undefined;
  const addressesPath = path.resolve(__dirname, "../../frontend-bridge/addresses.json");
  if (fs.existsSync(addressesPath)) {
    try {
      const raw = fs.readFileSync(addressesPath, "utf8");
      const parsed = raw.trim().length ? JSON.parse(raw) : {};
      const existing = parsed[String(chainId)];
      if (existing?.staking) {
        const explorerUrl = explorerBase
          ? `${explorerBase}/address/${existing.staking}`
          : "";
        existingStaking = {
          stakingAddress: existing.staking,
          sCratesAddress: existing.staking,
          explorerUrl
        };
      }
    } catch {
      // no-op: if parsing fails we'll just omit staking block
    }
  }

  writeBackendTokenData({
    horizen: {
      chainId,
      address: cratesAddress,
      explorerUrl: explorerBase ? `${explorerBase}/address/${cratesAddress}` : ""
    },
    base: {
      chainId: baseChainId,
      address: baseCratesAddress,
      explorerUrl: baseExplorer ? `${baseExplorer}/address/${baseCratesAddress}` : ""
    },
    totalSupply,
    staking: existingStaking,
    zenToken: {
      address: zenToken,
      explorerUrl: explorerBase ? `${explorerBase}/address/${zenToken}` : ""
    },
    zenStaking: {
      contractAddress: poolAddress,
      explorerUrl: explorerBase ? `${explorerBase}/address/${poolAddress}` : "",
      unstakeFeeBps
    }
  });

  const seedEnabled = (process.env.ZEN_STAKE_SEED_FROM_TREASURY || "false") === "true";
  const seedAmountInput = process.env.ZEN_STAKE_SEED_AMOUNT || "";
  const treasuryMatches = treasury.toLowerCase() === deployer.address.toLowerCase();

  if (seedEnabled && treasuryMatches) {
    const crates = await ethers.getContractAt("CratesToken", cratesAddress);
    const seedAmount = seedAmountInput
      ? ethers.parseUnits(seedAmountInput, 18)
      : ethers.parseUnits("0", 18);

    if (seedAmount > 0) {
      const tx = await crates.transfer(poolAddress, seedAmount);
      await tx.wait();
    }
  }

  console.log("Zen staking pool deployment complete:");
  console.log({
    chainId,
    zenToken,
    zenStaking: poolAddress,
    cratesPerZen: cratesPerZen.toString(),
    unstakeFeeBps,
    treasury
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
