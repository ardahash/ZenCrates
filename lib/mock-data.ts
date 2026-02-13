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
    name: "Real Yield Anchor Index",
    ticker: "zREAL",
    description:
      "Open-data proxy anchored to the U.S. 10-year real rate curve.",
    longDescription:
      "zREAL is a software-based proxy index derived from the U.S. Treasury real rate curve (10-year). It is not gold, not a benchmark, and does not represent physical custody or redemption.",
    category: "exposure",
    riskLevel: "medium",
    collateralType: "ETH",
    currentPrice: 118.4,
    priceChange24h: 0.42,
    tvl: 4520000,
    fees: { mint: 0.003, burn: 0.003, management: 0.005 },
    oracleSources: [
      {
        name: "US Treasury Real Rate Curve (10Y)",
        type: "off-chain",
        endpoint: "home.treasury.gov/.../daily_treasury_real_rate_curve",
      },
      {
        name: "Signed Oracle",
        type: "off-chain",
        endpoint: "https://oracle.zencrates.io/real-rate",
      },
    ],
    contractAddress: "0x0000000000000000000000000000000000000001",
    explorerUrl: "https://explorer.horizen.io/address/0x000...001",
    createdAt: "2025-06-01T00:00:00Z",
    isActive: true,
  },
  {
    id: "inflation-hedge",
    name: "CPI Anchor Index",
    ticker: "zCPI",
    description:
      "Open-data CPI-U index level as an inflation proxy.",
    longDescription:
      "zCPI tracks the CPI-U index level from the Bureau of Labor Statistics. It is an open-data proxy index with no custody of assets or redemption rights.",
    category: "exposure",
    riskLevel: "medium",
    collateralType: "ETH",
    currentPrice: 312.1,
    priceChange24h: 0.12,
    tvl: 1830000,
    fees: { mint: 0.005, burn: 0.005, management: 0.01 },
    oracleSources: [
      {
        name: "BLS CPI-U (CUUR0000SA0)",
        type: "off-chain",
        endpoint: "api.bls.gov/publicAPI/v2/timeseries/data",
      },
      {
        name: "Signed Oracle",
        type: "off-chain",
        endpoint: "https://oracle.zencrates.io/cpi",
      },
    ],
    contractAddress: "0x0000000000000000000000000000000000000002",
    explorerUrl: "https://explorer.horizen.io/address/0x000...002",
    createdAt: "2025-07-15T00:00:00Z",
    isActive: true,
  },
  {
    id: "macro-stress",
    name: "Curve Stress Index",
    ticker: "zSTRESS",
    description:
      "Open-data proxy derived from the 3M vs 10Y Treasury rate curve slope.",
    longDescription:
      "zSTRESS is a software index that tracks rate curve inversion pressure using U.S. Treasury 3-month and 10-year rates. It is not an official volatility index or licensed benchmark.",
    category: "strategy",
    riskLevel: "high",
    collateralType: "ETH",
    currentPrice: 100.6,
    priceChange24h: 1.05,
    tvl: 980000,
    fees: { mint: 0.005, burn: 0.005, management: 0.015 },
    oracleSources: [
      {
        name: "US Treasury Rate Curve (3M/10Y)",
        type: "off-chain",
        endpoint: "home.treasury.gov/.../daily_treasury_rate_curve",
      },
      {
        name: "Signed Oracle",
        type: "off-chain",
        endpoint: "https://oracle.zencrates.io/curve",
      },
    ],
    contractAddress: "0x0000000000000000000000000000000000000003",
    explorerUrl: "https://explorer.horizen.io/address/0x000...003",
    createdAt: "2025-08-01T00:00:00Z",
    isActive: true,
  },
  {
    id: "sp500-index",
    name: "Long Rate Momentum Index",
    ticker: "zLONG",
    description:
      "Open-data proxy anchored to the U.S. 10-year Treasury rate.",
    longDescription:
      "zLONG is a software-based proxy index derived from the U.S. Treasury 10-year nominal rate. It is not an official equity benchmark or licensed index.",
    category: "exposure",
    riskLevel: "medium",
    collateralType: "ETH",
    currentPrice: 4.12,
    priceChange24h: 0.06,
    tvl: 7200000,
    fees: { mint: 0.003, burn: 0.003, management: 0.005 },
    oracleSources: [
      {
        name: "US Treasury Rate Curve (10Y)",
        type: "off-chain",
        endpoint: "home.treasury.gov/.../daily_treasury_rate_curve",
      },
    ],
    contractAddress: "0x0000000000000000000000000000000000000004",
    explorerUrl: "https://explorer.horizen.io/address/0x000...004",
    createdAt: "2025-09-01T00:00:00Z",
    isActive: true,
  },
  {
    id: "btc-momentum",
    name: "Digital Momentum Index",
    ticker: "zDIGI",
    description:
      "Digital asset proxy referencing BTC/USD via on-chain oracles.",
    longDescription:
      "zDIGI is a synthetic index that references BTC/USD via on-chain oracle feeds. It is a software-based proxy with no custody of BTC or physical assets.",
    category: "strategy",
    riskLevel: "high",
    collateralType: "ETH",
    currentPrice: 46850.3,
    priceChange24h: -1.56,
    tvl: 2100000,
    fees: { mint: 0.004, burn: 0.004, management: 0.012 },
    oracleSources: [
      {
        name: "Chainlink BTC/USD (Base)",
        type: "on-chain",
        endpoint: "basescan.org/address/0x64c911996D3c6aC71f9b455B1E8E7266BcbD848F",
      },
    ],
    contractAddress: "0x0000000000000000000000000000000000000005",
    explorerUrl: "https://explorer.horizen.io/address/0x000...005",
    createdAt: "2025-10-01T00:00:00Z",
    isActive: true,
  },
  {
    id: "treasury-index",
    name: "Short Rate Index",
    ticker: "zSHORT",
    description:
      "Open-data proxy anchored to the U.S. 3-month Treasury rate.",
    longDescription:
      "zSHORT tracks the U.S. Treasury 3-month rate as an open-data proxy index. It is a synthetic exposure tool with no custody of securities.",
    category: "exposure",
    riskLevel: "low",
    collateralType: "ETH",
    currentPrice: 3.72,
    priceChange24h: 0.02,
    tvl: 3400000,
    fees: { mint: 0.002, burn: 0.002, management: 0.003 },
    oracleSources: [
      {
        name: "US Treasury Rate Curve (3M)",
        type: "off-chain",
        endpoint: "home.treasury.gov/.../daily_treasury_rate_curve",
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
      crateName: "Real Yield Anchor Index",
      ticker: "zREAL",
      category: "exposure",
      balance: 4.2,
      value: 9834.3,
      pnl: 456.78,
      pnlPercent: 4.87,
    },
    {
      crateId: "inflation-hedge",
      crateName: "CPI Anchor Index",
      ticker: "zCPI",
      category: "exposure",
      balance: 52.1,
      value: 5858.65,
      pnl: -123.45,
      pnlPercent: -2.06,
    },
    {
      crateId: "sp500-index",
      crateName: "Long Rate Momentum Index",
      ticker: "zLONG",
      category: "exposure",
      balance: 1.5,
      value: 8130.0,
      pnl: 890.12,
      pnlPercent: 12.3,
    },
    {
      crateId: "treasury-index",
      crateName: "Short Rate Index",
      ticker: "zSHORT",
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
    title: "Adjust zREAL oracle update cadence",
    description:
      "Proposal to increase the oracle update cadence for zREAL from every 60 minutes to every 15 minutes to improve index freshness during volatile periods.",
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
    title: "Reduce management fee for Short Rate Index",
    description:
      "Proposal to reduce the annual management fee for zSHORT from 0.3% to 0.15% to increase competitiveness.",
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
    title: "Emergency parameter update for Curve Stress Index",
    description:
      "Adjust the curve stress thresholds to better respond to rapid market movements. Requires multisig approval.",
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
    message: "zREAL crossed above $118",
    crateId: "zgold-index",
    timestamp: "2026-02-12T08:00:00Z",
    read: false,
  },
  {
    id: "alert-2",
    type: "governance",
    message: "New governance proposal: Adjust zREAL oracle cadence",
    timestamp: "2026-01-15T00:00:00Z",
    read: true,
  },
  {
    id: "alert-3",
    type: "price",
    message: "zDIGI moved below $46,000",
    crateId: "btc-momentum",
    timestamp: "2026-02-11T14:00:00Z",
    read: false,
  },
];
