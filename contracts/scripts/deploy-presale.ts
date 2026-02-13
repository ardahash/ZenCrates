import { ethers } from "hardhat";
import { writeAddresses } from "./utils";

async function main() {
  const [deployer] = await ethers.getSigners();

  const admin = process.env.ADMIN_ADDRESS || deployer.address;
  const cratesAddress = process.env.HORIZEN_CRATES_ADDRESS || "";
  if (!cratesAddress) {
    throw new Error("Missing HORIZEN_CRATES_ADDRESS");
  }

  const treasury = process.env.PRESALE_TREASURY || process.env.TREASURY_ADDRESS || deployer.address;
  const cratesPerEthInput = process.env.PRESALE_CRATES_PER_ETH || "100000";
  const maxEthInput = process.env.PRESALE_MAX_ETH || "10";

  const cratesPerEth = ethers.parseUnits(cratesPerEthInput, 18);
  const maxEth = ethers.parseEther(maxEthInput);

  const Presale = await ethers.getContractFactory("CratesPresale");
  const presale = await Presale.deploy(
    cratesAddress,
    treasury,
    cratesPerEth,
    maxEth,
    admin
  );
  await presale.waitForDeployment();

  const networkInfo = await deployer.provider!.getNetwork();
  const chainId = Number(networkInfo.chainId);

  writeAddresses(chainId, {
    name: "Horizen L3",
    chainId,
    presale: await presale.getAddress()
  });

  const seedEnabled = (process.env.PRESALE_SEED_FROM_TREASURY || "false") === "true";
  const seedAmountInput = process.env.PRESALE_SEED_AMOUNT || "";
  const treasuryMatches = treasury.toLowerCase() === deployer.address.toLowerCase();

  if (seedEnabled && treasuryMatches) {
    const crates = await ethers.getContractAt("CratesToken", cratesAddress);
    const defaultSeed = (maxEth * cratesPerEth) / ethers.parseEther("1");
    const seedAmount = seedAmountInput
      ? ethers.parseUnits(seedAmountInput, 18)
      : defaultSeed;

    const tx = await crates.transfer(await presale.getAddress(), seedAmount);
    await tx.wait();
  }

  console.log("Presale deployment complete:");
  console.log({
    chainId,
    presale: await presale.getAddress(),
    cratesPerEth: cratesPerEth.toString(),
    maxEth: maxEth.toString(),
    treasury
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
