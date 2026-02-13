export const TOKEN_META = {
  name: "Crates",
  symbol: "CRATES",
  decimals: 18,
  totalSupply: "100000000000000000000000000",
  chains: {
    horizenL3: {
      address: "0xFe472E5f392f06635247D6Df79067b088DF8B88d",
      explorerUrl: "https://horizen.calderaexplorer.xyz/address/0xFe472E5f392f06635247D6Df79067b088DF8B88d",
      chainId: 26514
    },
    base: {
      address: "0x4892f1affd524CbA32cf113FBFa78c7d1367Eb9B",
      explorerUrl: "https://base.blockscout.com/address/0x4892f1affd524CbA32cf113FBFa78c7d1367Eb9B",
      chainId: 8453
    }
  },
  staking: {
    contractAddress: "0xE8858eF5E1421bc49F075d2eFf41B04ac3794fDD",
    explorerUrl: "https://horizen.calderaexplorer.xyz/address/0xE8858eF5E1421bc49F075d2eFf41B04ac3794fDD",
    sCrates: {
      name: "Staked CRATES",
      symbol: "sCRATES",
      standard: "ERC-721",
      address: "0xE8858eF5E1421bc49F075d2eFf41B04ac3794fDD"
    }
  }
} as const;
