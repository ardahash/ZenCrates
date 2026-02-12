// ============================================================
// ZenCrates Mock Data
// TODO: Replace with real backend + chain reads
// ============================================================

import type {
  Crate,
  PriceData,
  Portfolio,
  Proposal,
  Alert,
  TokenMeta,
  TierRule,
  RewardSummary,
  BridgeStatus,
} from "./types";

export const MOCK_CRATES: Crate[] = [
  {
    id: "zgold-index",
    name: "Gold Exposure Index",
    ticker: "zGOLD-INDEX",
    description:
      "Synthetic exposure to the gold spot price via on-chain oracles. No physical custody.",
    longDescription:
      "zGOLD-INDEX provides synthetic market exposure that tracks the gold spot price using aggregated oracle feeds. This is a software-based index token — it does not represent ownership of physical gold, nor does it involve custody, storage, or redemption of any physical asset. Price deviations from the underlying index are possible.",
    category: "exposure",
    riskLevel: "medium",
    collateralType: "USDC",
    currentPrice: 2341.5,
    priceChange24h: 1.23,
    tvl: 4520000,
    fees: { mint: 0.003, burn: 0.003, management: 0.005 },
    oracleSources: [
      {
        name: "Chainlink Gold/USD",
        type: "on-chain",
        endpoint: "0x0000...chainlink", // TODO: real oracle address
      },
      {
        name: "ZenCrates Aggregator",
        type: "off-chain",
        endpoint: "https://placeholder-oracle.zencrates.io/gold", // TODO: real endpoint
      },
    ],
    contractAddress: "0x0000000000000000000000000000000000000001",
    explorerUrl: "https://explorer.horizen.io/address/0x000...001",
    createdAt: "2025-06-01T00:00:00Z",
    isActive: true,
  },
  {
    id: "inflation-hedge",
    name: "Inflation Hedge Crate",
    ticker: "zINFL-HEDGE",
    description:
      "Rules-based strategy rotating across inflation-sensitive synthetic assets.",
    longDescription:
      "The Inflation Hedge Crate uses a rules-based algorithm to allocate across multiple synthetic exposure tokens that tend to respond to inflationary macro conditions. The crate rebalances periodically based on oracle-reported economic indicators. This is not investment advice and past performance does not indicate future results.",
    category: "strategy",
    riskLevel: "high",
    collateralType: "USDC",
    currentPrice: 112.45,
    priceChange24h: -0.87,
    tvl: 1830000,
    fees: { mint: 0.005, burn: 0.005, management: 0.01 },
    oracleSources: [
      {
        name: "CPI Oracle Feed",
        type: "off-chain",
        endpoint: "https://placeholder-oracle.zencrates.io/cpi",
      },
      {
        name: "Multi-Asset Price Feed",
        type: "on-chain",
        endpoint: "0x0000...multi",
      },
    ],
    contractAddress: "0x0000000000000000000000000000000000000002",
    explorerUrl: "https://explorer.horizen.io/address/0x000...002",
    createdAt: "2025-07-15T00:00:00Z",
    isActive: true,
  },
  {
    id: "macro-stress",
    name: "Macro Stress Crate",
    ticker: "zMACRO-STR",
    description:
      "Strategy crate targeting portfolio hedging during macro stress events.",
    longDescription:
      "The Macro Stress Crate runs a rules-based strategy designed to shift allocations toward defensive synthetic positions when macro stress indicators trigger. Uses volatility indices and yield-curve oracle feeds to inform rebalancing. Not a guarantee against losses. This is experimental DeFi software.",
    category: "strategy",
    riskLevel: "high",
    collateralType: "Multi",
    currentPrice: 98.2,
    priceChange24h: 2.45,
    tvl: 980000,
    fees: { mint: 0.005, burn: 0.005, management: 0.015 },
    oracleSources: [
      {
        name: "VIX Oracle",
        type: "off-chain",
        endpoint: "https://placeholder-oracle.zencrates.io/vix",
      },
      {
        name: "Yield Curve Oracle",
        type: "off-chain",
        endpoint: "https://placeholder-oracle.zencrates.io/yield",
      },
    ],
    contractAddress: "0x0000000000000000000000000000000000000003",
    explorerUrl: "https://explorer.horizen.io/address/0x000...003",
    createdAt: "2025-08-01T00:00:00Z",
    isActive: true,
  },
  {
    id: "sp500-index",
    name: "S&P 500 Exposure",
    ticker: "zSP500",
    description:
      "Synthetic exposure tracking the S&P 500 index via oracle aggregation.",
    longDescription:
      "zSP500 provides synthetic market exposure to the S&P 500 index using multiple oracle data feeds. This token does not represent ownership of any equities or fund shares. It is purely a software-based synthetic instrument on the Horizen L3 network.",
    category: "exposure",
    riskLevel: "medium",
    collateralType: "USDC",
    currentPrice: 5420.0,
    priceChange24h: 0.34,
    tvl: 7200000,
    fees: { mint: 0.003, burn: 0.003, management: 0.005 },
    oracleSources: [
      {
        name: "Market Data Oracle",
        type: "off-chain",
        endpoint: "https://placeholder-oracle.zencrates.io/sp500",
      },
    ],
    contractAddress: "0x0000000000000000000000000000000000000004",
    explorerUrl: "https://explorer.horizen.io/address/0x000...004",
    createdAt: "2025-09-01T00:00:00Z",
    isActive: true,
  },
  {
    id: "btc-momentum",
    name: "BTC Momentum Crate",
    ticker: "zBTC-MOM",
    description:
      "Rules-based crate that adjusts BTC synthetic exposure based on momentum signals.",
    longDescription:
      "The BTC Momentum Crate uses a trend-following algorithm that increases or decreases synthetic BTC exposure based on moving-average crossover signals. Designed to reduce drawdowns during downtrends. This is experimental and not financial advice.",
    category: "strategy",
    riskLevel: "high",
    collateralType: "ETH",
    currentPrice: 145.3,
    priceChange24h: -1.56,
    tvl: 2100000,
    fees: { mint: 0.004, burn: 0.004, management: 0.012 },
    oracleSources: [
      {
        name: "BTC Price Oracle",
        type: "on-chain",
        endpoint: "0x0000...btc",
      },
    ],
    contractAddress: "0x0000000000000000000000000000000000000005",
    explorerUrl: "https://explorer.horizen.io/address/0x000...005",
    createdAt: "2025-10-01T00:00:00Z",
    isActive: true,
  },
  {
    id: "treasury-index",
    name: "Treasury Rate Index",
    ticker: "zTBILL",
    description:
      "Synthetic exposure to short-term treasury rate movements via oracle feeds.",
    longDescription:
      "zTBILL provides synthetic exposure to short-term US treasury rate movements. It does not represent ownership of any treasury securities. The index tracks rate changes through off-chain oracle feeds that report daily treasury yield data.",
    category: "exposure",
    riskLevel: "low",
    collateralType: "USDC",
    currentPrice: 101.12,
    priceChange24h: 0.02,
    tvl: 3400000,
    fees: { mint: 0.002, burn: 0.002, management: 0.003 },
    oracleSources: [
      {
        name: "Treasury Yield Oracle",
        type: "off-chain",
        endpoint: "https://placeholder-oracle.zencrates.io/tbill",
      },
    ],
    contractAddress: "0x0000000000000000000000000000000000000006",
    explorerUrl: "https://explorer.horizen.io/address/0x000...006",
    createdAt: "2025-11-01T00:00:00Z",
    isActive: true,
  },
];

// ============================================================
// CRATES Token Mock Data
// ============================================================

export const MOCK_TOKEN_META: TokenMeta = {
  name: "Crates",
  symbol: "CRATES",
  decimals: 18,
  totalSupply: "100000000000000000000000000", // 100M
  chains: {
    horizenL3: {
      address: "0x0000000000000000000000000000000000000000", // TODO: real address
      explorerUrl: "https://explorer.horizen.io/address/0x000...000", // TODO: real URL
      chainId: 0, // TODO: real chain ID
    },
    base: {
      address: "0x0000000000000000000000000000000000000000", // TODO: real bridged address
      explorerUrl: "https://basescan.org/address/0x000...000", // TODO: real URL
      chainId: 8453,
    },
  },
};

export const MOCK_TIERS: TierRule[] = [
  { tier: 0, label: "None", minBalance: 0, maxBalance: 999, rebatePercent: 0 },
  { tier: 1, label: "Bronze", minBalance: 1000, maxBalance: 9999, rebatePercent: 10 },
  { tier: 2, label: "Silver", minBalance: 10000, maxBalance: 49999, rebatePercent: 20 },
  { tier: 3, label: "Gold", minBalance: 50000, maxBalance: 199999, rebatePercent: 30 },
  { tier: 4, label: "Platinum", minBalance: 200000, maxBalance: null, rebatePercent: 40 },
];

export const MOCK_REWARD_SUMMARY: RewardSummary = {
  walletAddress: "0x71C7...93Fe",
  cratesBalance: 12500,
  currentTier: 2,
  tierLabel: "Silver",
  rebatePercent: 20,
  feesThisMonth: 45.8,
  estimatedRebateThisMonth: 9.16,
  history: [
    { month: "2026-01", feesPaid: 62.3, rebateApplied: 12.46, netFees: 49.84 },
    { month: "2025-12", feesPaid: 38.9, rebateApplied: 7.78, netFees: 31.12 },
    { month: "2025-11", feesPaid: 55.1, rebateApplied: 11.02, netFees: 44.08 },
    { month: "2025-10", feesPaid: 41.0, rebateApplied: 8.2, netFees: 32.8 },
    { month: "2025-09", feesPaid: 29.5, rebateApplied: 5.9, netFees: 23.6 },
  ],
};

export const MOCK_BRIDGE_STATUS: BridgeStatus = {
  direction: "horizenToBase",
  status: "idle",
  txHash: null,
  amount: null,
  estimatedTime: null,
};

function generatePriceHistory(
  basePrice: number,
  days: number = 30
): PriceData["snapshots"] {
  const snapshots: PriceData["snapshots"] = [];
  const now = Date.now();
  let price = basePrice * 0.95;

  for (let i = days; i >= 0; i--) {
    const change = (Math.random() - 0.48) * basePrice * 0.02;
    price = Math.max(price + change, basePrice * 0.8);
    snapshots.push({
      timestamp: now - i * 86400000,
      price: Math.round(price * 100) / 100,
    });
  }

  return snapshots;
}

export const MOCK_PRICE_DATA: PriceData[] = MOCK_CRATES.map((crate) => ({
  crateId: crate.id,
  snapshots: generatePriceHistory(crate.currentPrice),
}));

export const MOCK_PORTFOLIO: Portfolio = {
  totalValue: 24567.89,
  totalPnl: 1234.56,
  totalPnlPercent: 5.29,
  positions: [
    {
      crateId: "zgold-index",
      crateName: "Gold Exposure Index",
      ticker: "zGOLD-INDEX",
      category: "exposure",
      balance: 4.2,
      value: 9834.3,
      pnl: 456.78,
      pnlPercent: 4.87,
    },
    {
      crateId: "inflation-hedge",
      crateName: "Inflation Hedge Crate",
      ticker: "zINFL-HEDGE",
      category: "strategy",
      balance: 52.1,
      value: 5858.65,
      pnl: -123.45,
      pnlPercent: -2.06,
    },
    {
      crateId: "sp500-index",
      crateName: "S&P 500 Exposure",
      ticker: "zSP500",
      category: "exposure",
      balance: 1.5,
      value: 8130.0,
      pnl: 890.12,
      pnlPercent: 12.3,
    },
    {
      crateId: "treasury-index",
      crateName: "Treasury Rate Index",
      ticker: "zTBILL",
      category: "exposure",
      balance: 7.3,
      value: 738.18,
      pnl: 11.11,
      pnlPercent: 1.53,
    },
  ],
};

export const MOCK_PROPOSALS: Proposal[] = [
  {
    id: "prop-001",
    title: "Adjust zGOLD-INDEX oracle update frequency",
    description:
      "Proposal to increase the oracle update frequency for zGOLD-INDEX from every 60 minutes to every 15 minutes to improve price accuracy during volatile periods.",
    status: "active",
    votesFor: 125000,
    votesAgainst: 32000,
    votesAbstain: 8000,
    createdAt: "2026-01-15T00:00:00Z",
    endsAt: "2026-02-15T00:00:00Z",
    proposer: "0xAbCd...1234",
  },
  {
    id: "prop-002",
    title: "Add new Commodities Basket Crate",
    description:
      "Create a new exposure crate that tracks a basket of commodity indices including energy, agriculture, and metals via aggregated oracle feeds.",
    status: "passed",
    votesFor: 210000,
    votesAgainst: 15000,
    votesAbstain: 5000,
    createdAt: "2025-12-01T00:00:00Z",
    endsAt: "2026-01-01T00:00:00Z",
    proposer: "0xEfGh...5678",
  },
  {
    id: "prop-003",
    title: "Reduce management fee for Treasury Rate Index",
    description:
      "Proposal to reduce the annual management fee for zTBILL from 0.3% to 0.15% to increase competitiveness.",
    status: "rejected",
    votesFor: 45000,
    votesAgainst: 180000,
    votesAbstain: 20000,
    createdAt: "2025-11-01T00:00:00Z",
    endsAt: "2025-12-01T00:00:00Z",
    proposer: "0xIjKl...9012",
  },
  {
    id: "prop-004",
    title: "Emergency parameter update for Macro Stress Crate",
    description:
      "Adjust the rebalancing thresholds for the Macro Stress Crate to better respond to rapid market movements. Requires multisig approval.",
    status: "pending",
    votesFor: 0,
    votesAgainst: 0,
    votesAbstain: 0,
    createdAt: "2026-02-10T00:00:00Z",
    endsAt: "2026-03-10T00:00:00Z",
    proposer: "0xMnOp...3456",
  },
];

export const MOCK_ALERTS: Alert[] = [
  {
    id: "alert-1",
    type: "price",
    message: "zGOLD-INDEX crossed above $2,340",
    crateId: "zgold-index",
    timestamp: "2026-02-12T08:00:00Z",
    read: false,
  },
  {
    id: "alert-2",
    type: "governance",
    message: "New governance proposal: Adjust zGOLD-INDEX oracle frequency",
    timestamp: "2026-01-15T00:00:00Z",
    read: true,
  },
  {
    id: "alert-3",
    type: "price",
    message: "zBTC-MOM dropped below $146",
    crateId: "btc-momentum",
    timestamp: "2026-02-11T14:00:00Z",
    read: false,
  },
];
