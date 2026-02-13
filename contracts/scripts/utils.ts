import fs from "fs";
import path from "path";

export type ChainAddresses = {
  name: string;
  chainId: number;
  cratesToken?: string;
  wrappedCrates?: string;
  staking?: string;
  feeRebateController?: string;
  signedPriceOracle?: string;
  chainlinkOracle?: string;
  crateFactory?: string;
  presale?: string;
  governor?: string;
  timelock?: string;
  crates?: Record<string, string>;
};

export function writeAddresses(chainId: number, data: ChainAddresses) {
  const filePath = path.resolve(__dirname, "../../frontend-bridge/addresses.json");
  let existing: Record<string, any> = {};

  if (fs.existsSync(filePath)) {
    const raw = fs.readFileSync(filePath, "utf8");
    existing = raw.trim().length ? JSON.parse(raw) : {};
  }

  existing[String(chainId)] = {
    ...(existing[String(chainId)] || {}),
    ...data,
    chainId
  };
  existing.lastUpdated = new Date().toISOString();

  fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));
}

export function writeBackendTokenData(params: {
  horizen: { chainId: number; address: string; explorerUrl: string };
  base: { chainId: number; address: string; explorerUrl: string };
  totalSupply: string;
  staking?: { stakingAddress: string; sCratesAddress: string; explorerUrl: string };
}) {
  const filePath = path.resolve(__dirname, "../../backend/src/data/token.ts");
  const stakingBlock = params.staking
    ? `,\n  staking: {\n    contractAddress: "${params.staking.stakingAddress}",\n    explorerUrl: "${params.staking.explorerUrl}",\n    sCrates: {\n      name: "Staked CRATES",\n      symbol: "sCRATES",\n      standard: "ERC-721",\n      address: "${params.staking.sCratesAddress}"\n    }\n  }`
    : "";
  const contents = `export const TOKEN_META = {\n  name: "Crates",\n  symbol: "CRATES",\n  decimals: 18,\n  totalSupply: "${params.totalSupply}",\n  chains: {\n    horizenL3: {\n      address: "${params.horizen.address}",\n      explorerUrl: "${params.horizen.explorerUrl}",\n      chainId: ${params.horizen.chainId}\n    },\n    base: {\n      address: "${params.base.address}",\n      explorerUrl: "${params.base.explorerUrl}",\n      chainId: ${params.base.chainId}\n    }\n  }${stakingBlock}\n} as const;\n`;

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, contents);
}

export function writeBackendCratesData(params: {
  crates: Array<{
    id: string;
    name: string;
    ticker: string;
    description: string;
    longDescription: string;
    category: string;
    riskLevel: string;
    collateralType: string;
    currentPrice: number;
    priceChange24h: number;
    tvl: number;
    fees: { mint: number; burn: number; management: number };
    oracleSources: Array<{ name: string; type: string; endpoint: string }>;
    contractAddress: string;
    explorerUrl: string;
    createdAt: string;
    isActive: boolean;
  }>;
}) {
  const filePath = path.resolve(__dirname, "../../backend/src/data/crates.ts");
  const contents = `export const CRATES = ${JSON.stringify(params.crates, null, 2)} as const;\n`;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, contents);
}
