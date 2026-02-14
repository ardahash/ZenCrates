import { ethers } from "hardhat";
import fs from "fs";
import path from "path";
import { writeAddresses } from "./utils";

async function readWrappedCrates(chainId: number) {
  const filePath = path.resolve(__dirname, "../../frontend-bridge/addresses.json");
  if (!fs.existsSync(filePath)) return "";
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = raw.trim().length ? JSON.parse(raw) : {};
    return parsed[String(chainId)]?.wrappedCrates || "";
  } catch {
    return "";
  }
}

async function main() {
  const [deployer] = await ethers.getSigners();
  const admin = process.env.ADMIN_ADDRESS || deployer.address;

  const networkInfo = await deployer.provider!.getNetwork();
  const chainId = Number(networkInfo.chainId);

  const wrappedFromEnv =
    process.env.BASE_CRATES_ADDRESS ||
    process.env.BASE_WRAPPED_CRATES_ADDRESS ||
    "";
  const wrappedCrates = wrappedFromEnv || (await readWrappedCrates(chainId));
  if (!wrappedCrates) {
    throw new Error("Missing BASE_CRATES_ADDRESS (wCRATES) or addresses.json entry.");
  }

  const Staked = await ethers.getContractFactory("StakedCrates");
  const staking = await Staked.deploy(wrappedCrates, admin);
  await staking.waitForDeployment();

  writeAddresses(chainId, {
    name: "Base",
    chainId,
    baseStaking: await staking.getAddress()
  });

  console.log("Base staking deployment complete:");
  console.log({ chainId, baseStaking: await staking.getAddress(), wrappedCrates });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
