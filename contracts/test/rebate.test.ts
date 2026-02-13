import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

async function deployFixture() {
  const [deployer, user] = await ethers.getSigners();

  const Crates = await ethers.getContractFactory("CratesToken");
  const crates = await Crates.deploy(deployer.address, deployer.address, 0n);

  const Staked = await ethers.getContractFactory("StakedCrates");
  const staking = await Staked.deploy(await crates.getAddress(), deployer.address);

  const Controller = await ethers.getContractFactory("FeeRebateController");
  const controller = await Controller.deploy(await staking.getAddress(), deployer.address, 4000);

  return { deployer, user, crates, staking, controller };
}

describe("FeeRebateController", function () {
  it("calculates tiered rebates", async function () {
    const { user, crates, staking, controller } = await loadFixture(deployFixture);
    const amount = ethers.parseEther("1000");

    await controller.setTiers([
      { minAmount: 0, rebateBps: 0 },
      { minAmount: ethers.parseEther("100"), rebateBps: 500 },
      { minAmount: ethers.parseEther("500"), rebateBps: 1500 }
    ]);

    await crates.mint(user.address, amount);
    await crates.connect(user).approve(await staking.getAddress(), amount);
    await staking.connect(user).stake(amount, 0, 0);

    expect(await controller.rebateBps(user.address)).to.equal(1500);
  });
});
