import { expect } from "chai";
import { ethers } from "hardhat";


describe("WrappedCrates", function () {
  it("restricts minting to minter role", async function () {
    const [deployer, user] = await ethers.getSigners();
    const Wrapped = await ethers.getContractFactory("WrappedCrates");
    const wrapped = await Wrapped.deploy(deployer.address);

    await expect(wrapped.connect(user).mint(user.address, 100)).to.be.reverted;
    await wrapped.mint(user.address, 100);
    expect(await wrapped.balanceOf(user.address)).to.equal(100n);
  });
});
