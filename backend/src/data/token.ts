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
  zen: {
    symbol: "ZEN",
    address: "0x57da2D504bf8b83Ef304759d9f2648522D7a9280",
    explorerUrl: "https://horizen.calderaexplorer.xyz/address/0x57da2D504bf8b83Ef304759d9f2648522D7a9280"
  },
  zenStaking: {
    contractAddress: "0xBd3824FeDaf2Fd909f2Bf4bD2BA822342c3797A8",
    explorerUrl: "https://horizen.calderaexplorer.xyz/address/0xBd3824FeDaf2Fd909f2Bf4bD2BA822342c3797A8",
    unstakeFeeBps: 200
  }
} as const;
