import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  const Crates = await ethers.getContractFactory("CratesToken");
  const crates = await Crates.deploy(deployer.address, deployer.address, ethers.parseEther("1000000"));
  await crates.waitForDeployment();

  const Staked = await ethers.getContractFactory("StakedCrates");
  const staking = await Staked.deploy(await crates.getAddress(), deployer.address);
  await staking.waitForDeployment();

  const Controller = await ethers.getContractFactory("FeeRebateController");
  const controller = await Controller.deploy(await staking.getAddress(), deployer.address, 4000);
  await controller.waitForDeployment();

  console.log("Local deployment:");
  console.log({
    cratesToken: await crates.getAddress(),
    staking: await staking.getAddress(),
    feeRebateController: await controller.getAddress()
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
