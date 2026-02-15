import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";

type FixtureOptions = {
  priceDecimals?: number;
  ethPriceDecimals?: number;
  price?: string;
  ethPrice?: string;
  priceInverted?: boolean;
  unitScale?: bigint;
  priceMaxAge?: number;
  ethPriceMaxAge?: number;
};

async function deployFixture(options: FixtureOptions = {}) {
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
  const priceDecimals = options.priceDecimals ?? 8;
  const ethPriceDecimals = options.ethPriceDecimals ?? priceDecimals;
  const price = ethers.parseUnits(options.price ?? "2000", priceDecimals);
  const ethPrice = ethers.parseUnits(options.ethPrice ?? "2000", ethPriceDecimals);

  await priceOracle.setPrice(ethId, ethPrice);
  await priceOracle.setPrice(crateId, price);

  const EthCrate = await ethers.getContractFactory("EthCollateralCrate");
  const oracleCfg = {
    priceOracle: await priceOracle.getAddress(),
    priceOracleId: crateId,
    ethOracle: await priceOracle.getAddress(),
    ethOracleId: ethId,
    priceDecimals,
    ethPriceDecimals,
    priceMaxAge: options.priceMaxAge ?? 0,
    ethPriceMaxAge: options.ethPriceMaxAge ?? 0,
    priceInverted: options.priceInverted ?? false,
    unitScale: options.unitScale ?? ethers.parseUnits("1", 18)
  };
  const feeCfg = {
    mintFeeBps: 0,
    burnFeeBps: 0,
    collateralFactorBps: 10_000,
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

  return { deployer, user, crates, staking, controller, priceOracle, crate, ethId, crateId, priceDecimals, ethPriceDecimals };
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

  it("burns more ETH after oracle price increases (net of fees)", async function () {
    const fixture = await loadFixture(() =>
      deployFixture({ price: "200", ethPrice: "2000" })
    );
    const { deployer, user, crate, priceOracle, crateId } = fixture;

    await crate.connect(deployer).setFees(0, 30); // 0.30% burn fee

    const oneEth = ethers.parseEther("1");
    await crate.connect(user).mint({ value: oneEth });
    const tokens = await crate.balanceOf(user.address);

    const newPrice = ethers.parseUnits("204.62", 8); // +2.31%
    await priceOracle.setPrice(crateId, newPrice);

    const [ethOut] = await crate.previewBurn(user.address, tokens);

    const usdValue = (tokens * newPrice) / ethers.parseEther("1");
    const grossEth = (usdValue * ethers.parseEther("1")) / ethers.parseUnits("2000", 8);
    const fee = (grossEth * 30n) / 10_000n;
    const expectedNet = grossEth - fee;

    expect(ethOut).to.equal(expectedNet);
    expect(ethOut).to.be.gt(oneEth);
  });

  it("supports differing oracle decimals", async function () {
    const { user, crate } = await loadFixture(() =>
      deployFixture({ priceDecimals: 18, ethPriceDecimals: 8, price: "2000", ethPrice: "2000" })
    );

    const oneEth = ethers.parseEther("1");
    await crate.connect(user).mint({ value: oneEth });

    const balance = await crate.balanceOf(user.address);
    expect(balance).to.equal(oneEth);
  });

  it("inverts price feeds when configured", async function () {
    const { user, crate } = await loadFixture(() =>
      deployFixture({ price: "2", ethPrice: "2000", priceInverted: true })
    );

    const oneEth = ethers.parseEther("1");
    await crate.connect(user).mint({ value: oneEth });

    const balance = await crate.balanceOf(user.address);
    const expectedTokens = ethers.parseUnits("4000", 18);
    expect(balance).to.equal(expectedTokens);
  });

  it("reverts on stale oracle data", async function () {
    const { user, crate } = await loadFixture(() =>
      deployFixture({ priceMaxAge: 60, ethPriceMaxAge: 60 })
    );

    await time.increase(120);

    const oneEth = ethers.parseEther("1");
    await expect(crate.previewMint(user.address, oneEth)).to.be.revertedWithCustomError(
      crate,
      "StalePrice"
    );
  });
});
