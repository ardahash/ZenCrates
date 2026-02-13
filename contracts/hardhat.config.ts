import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

dotenv.config();

const deployerKey = process.env.DEPLOYER_PRIVATE_KEY || "";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.26",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: "cancun"
    }
  },
  networks: {
    hardhat: {},
    horizenL3: {
      url: process.env.HORIZEN_L3_RPC_URL || "",
      chainId: 26514,
      accounts: deployerKey ? [deployerKey] : []
    },
    base: {
      url: process.env.BASE_RPC_URL || "",
      chainId: 8453,
      accounts: deployerKey ? [deployerKey] : []
    }
  }
};

export default config;
