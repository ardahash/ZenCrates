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

  const Oracle = await ethers.getContractFactory("MockPriceOracle");
  const priceOracle = await Oracle.deploy();

  const ethId = ethers.id("eth-usd");
  const crateId = ethers.id("zgold-index");
  const price = ethers.parseUnits("2000", 8);

  await priceOracle.setPrice(ethId, price);
  await priceOracle.setPrice(crateId, price);

  const EthCrate = await ethers.getContractFactory("EthCollateralCrate");
  const oracleCfg = {
    priceOracle: await priceOracle.getAddress(),
    priceOracleId: crateId,
    ethOracle: await priceOracle.getAddress(),
    ethOracleId: ethId,
    priceDecimals: 8,
    ethPriceDecimals: 8
  };
  const feeCfg = {
    mintFeeBps: 0,
    burnFeeBps: 0,
    treasury: deployer.address
  };
  const crate = await EthCrate.deploy(
    "Real Yield Anchor Index",
    "zREAL",
    1,
    await controller.getAddress(),
    oracleCfg,
    feeCfg,
    deployer.address
  );

  return { deployer, user, crates, staking, controller, priceOracle, crate };
}

describe("EthCollateralCrate", function () {
  it("mints and burns 1:1 with ETH when prices match", async function () {
    const { user, crate } = await loadFixture(deployFixture);

    const oneEth = ethers.parseEther("1");
    await crate.connect(user).mint({ value: oneEth });

    const balance = await crate.balanceOf(user.address);
    expect(balance).to.equal(oneEth);

    const tx = await crate.connect(user).burn(oneEth);
    await expect(tx).to.changeEtherBalance(user, oneEth);
  });

  it("applies fee rebate on mint", async function () {
    const { user, crates, staking, controller, crate } = await loadFixture(deployFixture);

    await crate.setFees(100, 0); // 1% mint fee
    await controller.setTiers([
      { minAmount: 0, rebateBps: 0 },
      { minAmount: ethers.parseEther("10"), rebateBps: 5000 }
    ]);

    const stakeAmount = ethers.parseEther("20");
    await crates.mint(user.address, stakeAmount);
    await crates.connect(user).approve(await staking.getAddress(), stakeAmount);
    await staking.connect(user).stake(stakeAmount, 0, 0);

    const oneEth = ethers.parseEther("1");
    await crate.connect(user).mint({ value: oneEth });

    // Gross fee 1%, rebate 50% => net fee 0.5%, net ETH = 0.995
    const expectedTokens = ethers.parseEther("0.995");
    const balance = await crate.balanceOf(user.address);
    expect(balance).to.equal(expectedTokens);
  });
});
