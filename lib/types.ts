// ============================================================
// ZenCrates Type Definitions
// ============================================================

export type CrateCategory = "exposure" | "strategy" | "signal-nft";

export type RiskLevel = "low" | "medium" | "high";

export type CollateralType = "USDC" | "ETH" | "ZEN" | "Multi";

export interface OracleSource {
  name: string;
  type: "on-chain" | "off-chain";
  endpoint: string; // TODO: replace with real oracle endpoint
}

export interface Crate {
  id: string;
  name: string;
  ticker: string;
  description: string;
  longDescription: string;
  category: CrateCategory;
  riskLevel: RiskLevel;
  collateralType: CollateralType;
  currentPrice: number;
  priceChange24h: number;
  tvl: number;
  fees: {
    mint: number;
    burn: number;
    management: number;
  };
  oracleSources: OracleSource[];
  contractAddress: string; // TODO: replace with real contract address
  explorerUrl: string; // TODO: replace with real explorer URL
  createdAt: string;
  isActive: boolean;
}

export interface PriceSnapshot {
  timestamp: number;
  price: number;
}

export interface PriceData {
  crateId: string;
  snapshots: PriceSnapshot[];
}

export interface Position {
  crateId: string;
  crateName: string;
  ticker: string;
  category: CrateCategory;
  balance: number;
  value: number;
  pnl: number;
  pnlPercent: number;
}

export interface Portfolio {
  totalValue: number;
  totalPnl: number;
  totalPnlPercent: number;
  positions: Position[];
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  status: "active" | "passed" | "rejected" | "pending";
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  createdAt: string;
  endsAt: string;
  proposer: string;
}

export interface Alert {
  id: string;
  type: "price" | "liquidation" | "governance";
  message: string;
  crateId?: string;
  timestamp: string;
  read: boolean;
}

// ============================================================
// CRATES Token Types
// ============================================================

export interface TokenMeta {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string; // stringified big number
  chains: {
    horizenL3: {
      address: string; // TODO: replace with real contract address
      explorerUrl: string; // TODO: replace with real explorer URL
      chainId: number; // TODO: replace with real chain ID
    };
    base: {
      address: string; // TODO: replace with bridged contract address
      explorerUrl: string; // TODO: replace with real explorer URL
      chainId: number; // TODO: replace with real chain ID
    };
  };
  staking?: {
    contractAddress: string;
    explorerUrl: string;
    sCrates: {
      name: string;
      symbol: string;
      standard: string;
      address: string;
    };
  };
}

export interface TierRule {
  tier: number;
  label: string;
  minBalance: number;
  maxBalance: number | null; // null = no upper bound
  rebatePercent: number; // e.g. 10 means 10% fee rebate/discount
}

export interface RewardSummary {
  walletAddress: string;
  cratesBalance: number;
  currentTier: number;
  tierLabel: string;
  rebatePercent: number;
  feesThisMonth: number;
  estimatedRebateThisMonth: number;
  history: RewardHistoryEntry[];
}

export interface RewardHistoryEntry {
  month: string;
  feesPaid: number;
  rebateApplied: number;
  netFees: number;
}

export interface StakingPosition {
  positionId: string;
  amount: number;
  lockEnd: number;
  isLocked: boolean;
}

export interface StakingSummary {
  walletAddress: string;
  stakedBalance: number;
  positions: StakingPosition[];
  lastPositionId: string | null;
}

export interface BridgeStatus {
  direction: "horizenToBase" | "baseToHorizen";
  status: "idle" | "pending" | "confirming" | "complete" | "failed";
  txHash: string | null;
  amount: number | null;
  estimatedTime: string | null;
}

// ============================================================
// Placeholder integration constants
// ============================================================

// Placeholder integration constants
// TODO: Replace with real values from environment / deployment config
export const PLACEHOLDER_CONFIG = {
  CONTRACT_ADDRESSES: {
    CRATE_FACTORY: "0x0000000000000000000000000000000000000000",
    ORACLE_REGISTRY: "0x0000000000000000000000000000000000000000",
    GOVERNANCE: "0x0000000000000000000000000000000000000000",
  },
  RPC_URL: "https://horizen.calderachain.xyz/http",
  CHAIN_ID: 26514,
  ORACLE_ENDPOINT: "http://localhost:4000/api/prices",
  BACKEND_BASE_URL: "http://localhost:4000",
  CRATES_TOKEN: {
    HORIZEN_L3_ADDRESS: "0x0000000000000000000000000000000000000000", // TODO: replace with real CRATES token address
    BASE_ADDRESS: "0x0000000000000000000000000000000000000000", // TODO: replace with real bridged CRATES address
    HORIZEN_L3_CHAIN_ID: 26514,
    BASE_CHAIN_ID: 8453, // Base mainnet
    BRIDGE_CONTRACT: "0x0000000000000000000000000000000000000000", // TODO: replace with bridge contract
  },
} as const;
