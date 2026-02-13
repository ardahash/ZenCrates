import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

async function deployFixture() {
  const [deployer, user] = await ethers.getSigners();

  const Crates = await ethers.getContractFactory("CratesToken");
  const crates = await Crates.deploy(deployer.address, deployer.address, 0n);

  const Staked = await ethers.getContractFactory("StakedCrates");
  const staking = await Staked.deploy(await crates.getAddress(), deployer.address);

  return { deployer, user, crates, staking };
}

describe("StakedCrates voting snapshots", function () {
  it("snapshots voting power by block", async function () {
    const { user, crates, staking } = await loadFixture(deployFixture);

    const amount = ethers.parseEther("500");
    await crates.mint(user.address, amount);
    await crates.connect(user).approve(await staking.getAddress(), amount);
    await staking.connect(user).stake(amount, 0, 0);

    await staking.connect(user).delegate(user.address);

    const snapshotBlock = await ethers.provider.getBlockNumber();
    await ethers.provider.send("evm_mine", []);

    const pastVotes = await staking.getPastVotes(user.address, snapshotBlock);
    expect(pastVotes).to.equal(amount);
  });
});
