import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";

async function deployFixture() {
  const [deployer, user, treasury] = await ethers.getSigners();

  const Crates = await ethers.getContractFactory("CratesToken");
  const crates = await Crates.deploy(deployer.address, deployer.address, 0n);

  const Mock = await ethers.getContractFactory("MockERC20");
  const zen = await Mock.deploy("Zen", "ZEN");

  const Pool = await ethers.getContractFactory("ZenStakingPool");
  const pool = await Pool.deploy(
    await zen.getAddress(),
    await crates.getAddress(),
    treasury.address,
    ethers.parseUnits("1000", 18),
    200,
    deployer.address
  );

  const seed = ethers.parseUnits("1000000", 18);
  await crates.mint(deployer.address, seed);
  await crates.transfer(await pool.getAddress(), seed);

  return { deployer, user, treasury, crates, zen, pool };
}

describe("ZenStakingPool", function () {
  it("stakes and unstakes with fee", async function () {
    const { user, treasury, zen, pool } = await loadFixture(deployFixture);
    const zenAmount = ethers.parseUnits("10", 18);

    await zen.mint(user.address, zenAmount);
    await zen.connect(user).approve(await pool.getAddress(), zenAmount);

    await expect(pool.connect(user).stake(zenAmount)).to.changeTokenBalances(
      zen,
      [user, pool],
      [-zenAmount, zenAmount]
    );

    expect(await pool.stakedBalanceOf(user.address)).to.equal(zenAmount);

    const partial = ethers.parseUnits("4", 18);
    const fee = (partial * 200n) / 10_000n;
    const netZen = partial - fee;

    await expect(pool.connect(user).unstake(partial)).to.changeTokenBalances(
      zen,
      [user, treasury, pool],
      [netZen, fee, -partial]
    );

    expect(await pool.stakedBalanceOf(user.address)).to.equal(0n);
  });

  it("accrues and claims incentives", async function () {
    const { user, crates, zen, pool } = await loadFixture(deployFixture);
    const zenAmount = ethers.parseUnits("5", 18);
    const rewardAmount = ethers.parseUnits("1000", 18);

    await zen.mint(user.address, zenAmount);
    await zen.connect(user).approve(await pool.getAddress(), zenAmount);

    await pool.connect(user).stake(zenAmount);

    await pool.notifyRewardAmount(rewardAmount);
    const rewardRate = await pool.rewardRate();

    await time.increase(86400);

    const earned = await pool.earned(user.address);
    expect(earned).to.be.greaterThan(0n);

    const expected = rewardRate * 86400n;

    await expect(pool.connect(user).claimRewards()).to.changeTokenBalances(
      crates,
      [user, pool],
      [expected, -expected]
    );
  });

  it("allows staking without reward reserve and enforces pause", async function () {
    const { user, crates, zen, deployer } = await loadFixture(deployFixture);

    const Pool = await ethers.getContractFactory("ZenStakingPool");
    const pool = await Pool.deploy(
      await zen.getAddress(),
      await crates.getAddress(),
      deployer.address,
      ethers.parseUnits("1000", 18),
      200,
      deployer.address
    );

    await zen.mint(user.address, ethers.parseUnits("1", 18));
    await zen.connect(user).approve(await pool.getAddress(), ethers.parseUnits("1", 18));

    await expect(pool.connect(user).pause()).to.be.reverted;
    await pool.pause();
    await expect(pool.connect(user).stake(ethers.parseUnits("1", 18))).to.be.reverted;
    await pool.unpause();
    await expect(pool.connect(user).stake(ethers.parseUnits("1", 18))).to.not.be.reverted;
  });
});
