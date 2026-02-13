import { ethers } from "hardhat";
import { writeAddresses, writeBackendTokenData } from "./utils";

async function main() {
  const [deployer] = await ethers.getSigners();
  const admin = process.env.ADMIN_ADDRESS || deployer.address;

  const Wrapped = await ethers.getContractFactory("WrappedCrates");
  const wrapped = await Wrapped.deploy(admin);
  await wrapped.waitForDeployment();

  const networkInfo = await deployer.provider!.getNetwork();
  const chainId = Number(networkInfo.chainId);

  const explorerBase = process.env.BASE_EXPLORER || "";

  writeAddresses(chainId, {
    name: "Base",
    chainId,
    wrappedCrates: await wrapped.getAddress()
  });

  const horizenChainId = Number(process.env.HORIZEN_L3_CHAIN_ID || 0);
  const horizenAddress = process.env.HORIZEN_CRATES_ADDRESS || "0x0000000000000000000000000000000000000000";
  const horizenExplorer = process.env.HORIZEN_L3_EXPLORER || "";
  const horizenStaking = process.env.HORIZEN_STAKING_ADDRESS || "";
  const horizenSCrates = process.env.HORIZEN_SCRATES_ADDRESS || horizenStaking;

  const totalSupply = process.env.CRATES_TOTAL_SUPPLY || "100000000000000000000000000";

  writeBackendTokenData({
    horizen: {
      chainId: horizenChainId,
      address: horizenAddress,
      explorerUrl: horizenExplorer ? `${horizenExplorer}/address/${horizenAddress}` : ""
    },
    base: {
      chainId,
      address: await wrapped.getAddress(),
      explorerUrl: explorerBase ? `${explorerBase}/address/${await wrapped.getAddress()}` : ""
    },
    totalSupply,
    staking: horizenStaking
      ? {
          stakingAddress: horizenStaking,
          sCratesAddress: horizenSCrates,
          explorerUrl: horizenExplorer ? `${horizenExplorer}/address/${horizenStaking}` : ""
        }
      : undefined
  });

  console.log("Base deployment complete:");
  console.log({ chainId, wrappedCrates: await wrapped.getAddress() });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
