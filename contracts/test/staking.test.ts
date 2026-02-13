import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

async function deployFixture() {
  const [deployer, user, other] = await ethers.getSigners();

  const Crates = await ethers.getContractFactory("CratesToken");
  const crates = await Crates.deploy(deployer.address, deployer.address, 0n);

  const Staked = await ethers.getContractFactory("StakedCrates");
  const staking = await Staked.deploy(await crates.getAddress(), deployer.address);

  return { deployer, user, other, crates, staking };
}

describe("StakedCrates", function () {
  it("mints and unstakes 1:1", async function () {
    const { user, crates, staking } = await loadFixture(deployFixture);
    const amount = ethers.parseEther("1000");

    await crates.mint(user.address, amount);
    await crates.connect(user).approve(await staking.getAddress(), amount);

    await staking.connect(user).stake(amount, 0, 0);
    const positionId = (await staking.nextPositionId()) - 1n;

    expect(await staking.ownerOf(positionId)).to.equal(user.address);
    expect(await staking.stakedBalanceOf(user.address)).to.equal(amount);
    expect(await staking.totalStaked()).to.equal(amount);

    await expect(staking.connect(user).unstake(positionId)).to.changeTokenBalances(
      crates,
      [user, staking],
      [amount, -amount]
    );

    expect(await staking.totalStaked()).to.equal(0n);
  });

  it("tracks multi-position ownership", async function () {
    const { user, other, crates, staking } = await loadFixture(deployFixture);
    const amountA = ethers.parseEther("250");
    const amountB = ethers.parseEther("400");

    await crates.mint(user.address, amountA + amountB);
    await crates.connect(user).approve(await staking.getAddress(), amountA + amountB);

    await staking.connect(user).stake(amountA, 0, 0);
    const posA = (await staking.nextPositionId()) - 1n;

    await staking.connect(user).stake(amountB, 0, 0);

    expect(await staking.stakedBalanceOf(user.address)).to.equal(amountA + amountB);

    await staking.connect(user).transferFrom(user.address, other.address, posA);

    expect(await staking.stakedBalanceOf(user.address)).to.equal(amountB);
    expect(await staking.stakedBalanceOf(other.address)).to.equal(amountA);

    await staking.connect(other).transferFrom(other.address, user.address, posA);
    expect(await staking.stakedBalanceOf(user.address)).to.equal(amountA + amountB);
  });

  it("pauses staking and requires admin", async function () {
    const { user, crates, staking } = await loadFixture(deployFixture);
    const amount = ethers.parseEther("10");
    await crates.mint(user.address, amount);
    await crates.connect(user).approve(await staking.getAddress(), amount);

    await expect(staking.connect(user).pause()).to.be.reverted;
    await staking.pause();
    await expect(staking.connect(user).stake(amount, 0, 0)).to.be.reverted;
  });
});
