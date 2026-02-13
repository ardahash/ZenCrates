import { expect } from "chai";
import { ethers } from "hardhat";


describe("Fuzz staking invariants", function () {
  it("stakes and unstakes random amounts 1:1", async function () {
    const [deployer, user] = await ethers.getSigners();

    const Crates = await ethers.getContractFactory("CratesToken");
    const crates = await Crates.deploy(deployer.address, deployer.address, 0n);

    const Staked = await ethers.getContractFactory("StakedCrates");
    const staking = await Staked.deploy(await crates.getAddress(), deployer.address);

    const maxAmount = ethers.parseEther("1000000");
    await crates.mint(user.address, maxAmount);
    await crates.connect(user).approve(await staking.getAddress(), maxAmount);

    for (let i = 0; i < 20; i++) {
      const snapshot = await ethers.provider.send("evm_snapshot", []);
      const raw = Math.floor(Math.random() * 1000) + 1;
      const amount = ethers.parseEther(raw.toString());

      await staking.connect(user).stake(amount, 0, 0);
      const positionId = (await staking.nextPositionId()) - 1n;

      const before = await crates.balanceOf(user.address);
      await staking.connect(user).unstake(positionId);
      const after = await crates.balanceOf(user.address);

      expect(after).to.equal(before + amount);
      await ethers.provider.send("evm_revert", [snapshot]);
    }
  });
});
