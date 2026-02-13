import { ethers } from "hardhat";

const DEFAULT_TIERS = [
  { min: "0", rebateBps: 0 },
  { min: "1000", rebateBps: 1000 },
  { min: "10000", rebateBps: 2000 },
  { min: "50000", rebateBps: 3000 },
  { min: "200000", rebateBps: 4000 }
];

async function main() {
  const [deployer] = await ethers.getSigners();
  const controllerAddress = process.env.FEE_REBATE_CONTROLLER_ADDRESS || "";
  if (!controllerAddress) {
    throw new Error("Missing FEE_REBATE_CONTROLLER_ADDRESS in .env");
  }

  const tiers = DEFAULT_TIERS.map((tier) => ({
    minAmount: ethers.parseUnits(tier.min, 18),
    rebateBps: tier.rebateBps
  }));

  const controller = await ethers.getContractAt("FeeRebateController", controllerAddress, deployer);
  const tx = await controller.setTiers(tiers);
  await tx.wait();

  console.log("Rebate tiers updated:");
  console.log({ controller: controllerAddress, tiers: DEFAULT_TIERS });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});