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

  const Strategy = await ethers.getContractFactory("StrategyCrate");
  const strategy = await Strategy.deploy(2, await controller.getAddress(), deployer.address);

  return { deployer, user, crates, staking, controller, strategy };
}

describe("Crate fee rebates", function () {
  it("applies rebate bps with rounding", async function () {
    const { user, crates, staking, controller, strategy } = await loadFixture(deployFixture);

    await controller.setTiers([
      { minAmount: 0, rebateBps: 0 },
      { minAmount: ethers.parseEther("10"), rebateBps: 500 }
    ]);

    const stakeAmount = ethers.parseEther("20");
    await crates.mint(user.address, stakeAmount);
    await crates.connect(user).approve(await staking.getAddress(), stakeAmount);
    await staking.connect(user).stake(stakeAmount, 0, 0);

    const grossFee = 101n;
    const tx = await strategy.chargeFee(user.address, grossFee);
    await expect(tx)
      .to.emit(strategy, "FeeCharged")
      .withArgs(user.address, grossFee, 500, 96n, 2);
  });
});
