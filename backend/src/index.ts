import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { ethers } from "ethers";
import { TOKEN_META } from "./data/token.js";
import { TIERS } from "./data/tiers.js";
import { CRATES } from "./data/crates.js";
import { BRIDGE_STATUS } from "./data/bridge.js";

type Tier = {
  tier: number;
  label: string;
  minBalance: number;
  maxBalance: number | null;
  rebatePercent: number;
};

type Crate = {
  id: string;
  name: string;
  ticker: string;
  description: string;
  longDescription?: string;
  category: string;
  riskLevel: string;
  collateralType: string;
  currentPrice: number;
  priceChange24h: number;
  tvl: number;
  fees: {
    mint: number;
    burn: number;
    management: number;
  };
  oracleSources: ReadonlyArray<{ name: string; type: string; endpoint: string }>;
  createdAt: string;
  isActive: boolean;
  contractAddress?: string;
  explorerUrl?: string;
};

const BASE_TIERS: Tier[] = TIERS.map((tier) => ({ ...tier }));
const CRATES_DATA: Crate[] = CRATES.map((crate) => ({ ...crate }));

function getEventPositionId(log: ethers.Log | ethers.EventLog): bigint | null {
  if ("args" in log && log.args) {
    const args = log.args as { positionId?: bigint } & Array<unknown>;
    const positionId = (args.positionId ?? args[1]) as bigint | undefined;
    return positionId ?? null;
  }
  return null;
}

const app = express();
app.use(cors());
app.use(express.json());

const DEFAULT_WALLET = "0x0000000000000000000000000000000000000000";

const rpcUrl =
  process.env.BACKEND_RPC_URL ||
  process.env.HORIZEN_L3_RPC_URL ||
  process.env.ORACLE_RPC_URL ||
  "https://horizen.calderachain.xyz/http";

const provider = new ethers.JsonRpcProvider(rpcUrl);

const oracleAddress =
  process.env.PRICE_ORACLE_ADDRESS ||
  process.env.ORACLE_CONTRACT_ADDRESS ||
  "";

const rebateControllerAddress = process.env.FEE_REBATE_CONTROLLER_ADDRESS || "";

const oracleAbi = ["function getPrice(bytes32) view returns (uint256,uint256)"];
const ethCrateAbi = [
  "function latestPrice() view returns (uint256,uint256)",
  "function latestEthPrice() view returns (uint256,uint256)",
  "function priceDecimals() view returns (uint8)",
  "function ethPriceDecimals() view returns (uint8)",
  "function priceInverted() view returns (bool)",
  "function unitScale() view returns (uint256)"
];
const erc20Abi = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "event Minted(address indexed user, uint256 ethIn, uint256 tokensOut, uint256 feeEth)",
  "event Burned(address indexed user, uint256 tokensIn, uint256 ethOut, uint256 feeEth)"
];
const stakingAbi = [
  "function stakedBalanceOf(address) view returns (uint256)",
  "function positionInfo(uint256) view returns (uint256 amount, uint64 lockEnd)",
  "event Staked(address indexed user, uint256 indexed positionId, uint256 amount)",
  "event Unstaked(address indexed user, uint256 indexed positionId, uint256 amount)"
];
const rebateAbi = [
  "function tiers() view returns ((uint256 minAmount,uint16 rebateBps)[])",
  "function maxRebateBps() view returns (uint16)"
];

const oracle = oracleAddress ? new ethers.Contract(oracleAddress, oracleAbi, provider) : null;
const stakingAddress =
  process.env.HORIZEN_STAKING_ADDRESS ||
  (TOKEN_META as { staking?: { contractAddress: string } }).staking?.contractAddress ||
  "";
const staking = stakingAddress ? new ethers.Contract(stakingAddress, stakingAbi, provider) : null;
const rebateController = rebateControllerAddress
  ? new ethers.Contract(rebateControllerAddress, rebateAbi, provider)
  : null;

const baseRpcUrl = process.env.BASE_RPC_URL || "https://mainnet.base.org";
const baseProvider = new ethers.JsonRpcProvider(baseRpcUrl);
const baseStakingAddress = process.env.BASE_STAKING_ADDRESS || "";
const baseStaking = baseStakingAddress
  ? new ethers.Contract(baseStakingAddress, stakingAbi, baseProvider)
  : null;

const priceDecimals = Number(process.env.ORACLE_PRICE_DECIMALS || 8);
const ethPriceDecimals = Number(process.env.ETH_PRICE_DECIMALS || priceDecimals);
const ethOracleIdInput = process.env.ETH_USD_ORACLE_ID || "eth-usd";
const ethOracleId =
  ethOracleIdInput.startsWith("0x") && ethOracleIdInput.length === 66
    ? ethOracleIdInput
    : ethers.id(ethOracleIdInput);

const historyPath =
  process.env.ORACLE_HISTORY_PATH ||
  path.resolve(process.cwd(), "data", "oracle-history.json");

const defaultTierLabels = BASE_TIERS.map((tier) => tier.label);

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

type CratePricing = {
  priceRaw: bigint;
  priceTimestamp: number;
  priceDecimals: number;
  priceInverted: boolean;
  unitScale: bigint;
  ethPriceRaw: bigint;
  ethPriceTimestamp: number;
  ethPriceDecimals: number;
};

let cachedTiers: { data: Tier[]; fetchedAt: number } | null = null;

function getPriceAt(crateId: string, timestampSec: number, fallback: number) {
  const history = getHistory(crateId);
  if (history.length === 0) return fallback;
  for (let i = history.length - 1; i >= 0; i--) {
    const entry = history[i];
    if (entry.timestamp <= timestampSec) {
      return Number(entry.price);
    }
  }
  return Number(history[0].price);
}

function normalizeCrateId(id: string) {
  return id.startsWith("0x") && id.length === 66 ? id : ethers.id(id);
}

async function fetchOraclePrice(crateId: string) {
  if (!oracle) return { price: 0n, timestamp: 0 };
  const [price, timestamp] = await oracle.getPrice(normalizeCrateId(crateId));
  return { price: BigInt(price), timestamp: Number(timestamp) };
}

async function fetchCratePricing(crateAddress: string): Promise<CratePricing | null> {
  if (!crateAddress || crateAddress === ZERO_ADDRESS) return null;
  const crate = new ethers.Contract(crateAddress, ethCrateAbi, provider);
  const [
    latestPrice,
    latestEthPrice,
    priceDecimalsRaw,
    ethPriceDecimalsRaw,
    priceInvertedRaw,
    unitScaleRaw
  ] = await Promise.all([
    crate.latestPrice(),
    crate.latestEthPrice(),
    crate.priceDecimals(),
    crate.ethPriceDecimals(),
    crate.priceInverted(),
    crate.unitScale()
  ]);

  return {
    priceRaw: BigInt(latestPrice[0]),
    priceTimestamp: Number(latestPrice[1]),
    priceDecimals: Number(priceDecimalsRaw),
    priceInverted: Boolean(priceInvertedRaw),
    unitScale: BigInt(unitScaleRaw),
    ethPriceRaw: BigInt(latestEthPrice[0]),
    ethPriceTimestamp: Number(latestEthPrice[1]),
    ethPriceDecimals: Number(ethPriceDecimalsRaw)
  };
}

function formatPrice(raw: bigint, decimals: number) {
  if (raw === 0n) return 0;
  return Number(ethers.formatUnits(raw, decimals));
}

function normalizeHistoryPrice(value: number, pricing: CratePricing | null) {
  if (!pricing || !value) return value;
  let normalized = value;
  if (pricing.priceInverted) {
    normalized = normalized === 0 ? 0 : 1 / normalized;
  }
  if (pricing.unitScale !== 0n && pricing.unitScale !== 10n ** 18n) {
    const scale = Number(ethers.formatUnits(pricing.unitScale, 18));
    normalized *= scale;
  }
  return normalized;
}

function loadHistory(): Record<string, Array<{ timestamp: number; price: string }>> {
  if (!fs.existsSync(historyPath)) {
    return {};
  }
  const raw = fs.readFileSync(historyPath, "utf8");
  if (!raw.trim()) return {};
  try {
    const parsed = JSON.parse(raw) as { entries?: Record<string, Array<{ timestamp: number; price: string }>> };
    return parsed.entries ?? {};
  } catch {
    return {};
  }
}

function getHistory(crateId: string) {
  const all = loadHistory();
  return all[crateId] ?? [];
}

function computeChange24h(
  crateId: string,
  currentPrice: number,
  normalize?: (price: number) => number
) {
  if (!currentPrice) return 0;
  const history = getHistory(crateId);
  if (history.length === 0) return 0;
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const past = [...history].reverse().find((entry) => entry.timestamp * 1000 <= cutoff);
  if (!past) return 0;
  const pastPrice = normalize ? normalize(Number(past.price)) : Number(past.price);
  if (!pastPrice) return 0;
  return ((currentPrice - pastPrice) / pastPrice) * 100;
}

async function computeTvl(crateAddress: string, ethUsdPriceRaw: bigint, ethPriceDecimalsValue: number) {
  if (!crateAddress || crateAddress === "0x0000000000000000000000000000000000000000") return 0;
  const balance = await provider.getBalance(crateAddress);
  if (balance === 0n || ethUsdPriceRaw === 0n) return 0;
  const usdValueScaled = (balance * ethUsdPriceRaw) / 10n ** 18n;
  return Number(ethers.formatUnits(usdValueScaled, ethPriceDecimalsValue));
}

function resolveTier(balance: number, tiers: Tier[]) {
  let current: Tier = tiers[0] ?? {
    tier: 0,
    label: "None",
    minBalance: 0,
    maxBalance: null,
    rebatePercent: 0
  };
  for (const tier of tiers) {
    if (balance >= tier.minBalance && (tier.maxBalance === null || balance <= tier.maxBalance)) {
      current = tier;
    }
  }
  return current;
}

async function buildStakingSummary(
  contract: ethers.Contract,
  wallet: string,
  fromBlock: number
) {
  const nowSec = Math.floor(Date.now() / 1000);

  const [stakedBalanceRaw, stakedLogs, unstakedLogs] = await Promise.all([
    contract.stakedBalanceOf(wallet),
    contract.queryFilter(contract.filters.Staked(wallet), fromBlock, "latest"),
    contract.queryFilter(contract.filters.Unstaked(wallet), fromBlock, "latest")
  ]);

  const stakedIds = new Set<string>();
  for (const log of stakedLogs) {
    const positionId = getEventPositionId(log);
    if (positionId !== null) {
      stakedIds.add(positionId.toString());
    }
  }

  const unstakedIds = new Set<string>();
  for (const log of unstakedLogs) {
    const positionId = getEventPositionId(log);
    if (positionId !== null) {
      unstakedIds.add(positionId.toString());
    }
  }

  const candidateIds = [...stakedIds].filter((id) => !unstakedIds.has(id));

  const positions = (
    await Promise.all(
      candidateIds.map(async (id) => {
        try {
          const info = await contract.positionInfo(id);
          const amount = Number(ethers.formatUnits(info.amount, 18));
          const lockEnd = Number(info.lockEnd);
          return {
            positionId: id,
            amount,
            lockEnd,
            isLocked: lockEnd > 0 && lockEnd > nowSec
          };
        } catch {
          return null;
        }
      })
    )
  ).filter(Boolean) as Array<{ positionId: string; amount: number; lockEnd: number; isLocked: boolean }>;

  positions.sort((a, b) => Number(a.positionId) - Number(b.positionId));

  const lastPositionId = positions.length ? positions[positions.length - 1].positionId : null;

  return {
    stakedBalance: Number(ethers.formatUnits(stakedBalanceRaw, 18)),
    positions,
    lastPositionId
  };
}

async function fetchTierRules() {
  if (!rebateController) return BASE_TIERS;
  const now = Date.now();
  if (cachedTiers && now - cachedTiers.fetchedAt < 30_000) {
    return cachedTiers.data;
  }

  const rawTiers: Array<{ minAmount: bigint; rebateBps: number }> = await rebateController.tiers();
  const mapped: Tier[] = rawTiers.map((tier, index) => {
    const minBalance = Number(ethers.formatUnits(tier.minAmount, 18));
    const rebatePercent = Number(tier.rebateBps) / 100;
    const label = defaultTierLabels[index] ?? `Tier ${index}`;
    return {
      tier: index,
      label,
      minBalance,
      maxBalance: null as number | null,
      rebatePercent
    };
  });

  for (let i = 0; i < mapped.length; i++) {
    if (i < mapped.length - 1) {
      mapped[i].maxBalance = Math.max(mapped[i + 1].minBalance - 1, mapped[i].minBalance);
    }
  }

  cachedTiers = { data: mapped, fetchedAt: now };
  return mapped;
}

app.get("/api/token", (_req, res) => {
  res.json(TOKEN_META);
});

app.get("/api/tiers", async (_req, res) => {
  const tiers = await fetchTierRules();
  res.json(tiers);
});

app.get("/api/rewards", async (req, res) => {
  const wallet = typeof req.query.wallet === "string" ? req.query.wallet : DEFAULT_WALLET;
  let stakedBalance = 0;
  if (staking && ethers.isAddress(wallet)) {
    const raw = await staking.stakedBalanceOf(wallet);
    stakedBalance = Number(ethers.formatUnits(raw, 18));
  }

  const tiers = await fetchTierRules();
  const tier = resolveTier(stakedBalance, tiers);

  res.json({
    walletAddress: wallet,
    cratesBalance: stakedBalance,
    currentTier: tier.tier,
    tierLabel: tier.label,
    rebatePercent: tier.rebatePercent,
    feesThisMonth: 0,
    estimatedRebateThisMonth: 0,
    history: []
  });
});

app.get("/api/crates", async (_req, res) => {
  const crates = await Promise.all(
    CRATES_DATA.map(async (crate) => {
      const pricing = await fetchCratePricing(crate.contractAddress ?? "");
      const currentPrice = pricing ? formatPrice(pricing.priceRaw, pricing.priceDecimals) : 0;
      const priceChange24h = computeChange24h(crate.id, currentPrice, (value) =>
        normalizeHistoryPrice(value, pricing)
      );
      const tvl = pricing
        ? await computeTvl(crate.contractAddress ?? "", pricing.ethPriceRaw, pricing.ethPriceDecimals)
        : 0;

      return {
        ...crate,
        currentPrice,
        priceChange24h,
        tvl,
        collateralType: "ETH",
        priceTimestamp: pricing?.priceTimestamp ?? 0,
        ethPriceTimestamp: pricing?.ethPriceTimestamp ?? 0
      };
    })
  );

  res.json({ crates });
});

app.get("/api/crates/:id", async (req, res) => {
  const crate = CRATES_DATA.find((item) => item.id === req.params.id);
  if (!crate) {
    res.status(404).json({ error: "Crate not found" });
    return;
  }

  const pricing = await fetchCratePricing(crate.contractAddress ?? "");
  const currentPrice = pricing ? formatPrice(pricing.priceRaw, pricing.priceDecimals) : 0;
  const priceChange24h = computeChange24h(crate.id, currentPrice, (value) =>
    normalizeHistoryPrice(value, pricing)
  );
  const tvl = pricing
    ? await computeTvl(crate.contractAddress ?? "", pricing.ethPriceRaw, pricing.ethPriceDecimals)
    : 0;

  const history = getHistory(crate.id).slice(-90);
  const priceHistory = history.map((entry) => ({
    timestamp: entry.timestamp * 1000,
    price: Number(entry.price)
  }));

  res.json({
    crate: {
      ...crate,
      currentPrice,
      priceChange24h,
      tvl,
      collateralType: "ETH",
      priceTimestamp: pricing?.priceTimestamp ?? 0,
      ethPriceTimestamp: pricing?.ethPriceTimestamp ?? 0
    },
    priceHistory
  });
});

app.get("/api/prices", async (_req, res) => {
  const prices = await Promise.all(
    CRATES_DATA.map(async (crate) => {
      const pricing = await fetchCratePricing(crate.contractAddress ?? "");
      const formatted = pricing ? formatPrice(pricing.priceRaw, pricing.priceDecimals) : 0;
      return {
        crateId: crate.id,
        ticker: crate.ticker,
        price: formatted,
        change24h: computeChange24h(crate.id, formatted, (value) =>
          normalizeHistoryPrice(value, pricing)
        ),
        timestamp: pricing?.priceTimestamp ? pricing.priceTimestamp * 1000 : Date.now()
      };
    })
  );

  res.json({ prices });
});

app.get("/api/portfolio", async (req, res) => {
  const wallet = typeof req.query.wallet === "string" ? req.query.wallet : DEFAULT_WALLET;
  if (!ethers.isAddress(wallet)) {
    res.json({ totalValue: 0, totalPnl: 0, totalPnlPercent: 0, positions: [] });
    return;
  }

  const crateFromBlock = Number(process.env.CRATE_DEPLOY_BLOCK || 0);
  const blockTimeCache = new Map<number, number>();
  const nowSec = Math.floor(Date.now() / 1000);
  const ethUsdNow = await fetchOraclePrice(ethOracleId);
  const ethUsdPriceNow = formatPrice(ethUsdNow.price, ethPriceDecimals);

  const prices = new Map<string, number>();
  for (const crate of CRATES_DATA) {
    const pricing = await fetchCratePricing(crate.contractAddress ?? "");
    if (pricing) {
      prices.set(crate.id, formatPrice(pricing.priceRaw, pricing.priceDecimals));
    } else {
      prices.set(crate.id, 0);
    }
  }

  const getBlockTimestamp = async (blockNumber: number) => {
    if (blockTimeCache.has(blockNumber)) {
      return blockTimeCache.get(blockNumber)!;
    }
    const block = await provider.getBlock(blockNumber);
    const ts = block?.timestamp ? Number(block.timestamp) : nowSec;
    blockTimeCache.set(blockNumber, ts);
    return ts;
  };

  const positionsWithCost = await Promise.all(
    CRATES_DATA.map(async (crate) => {
      if (!crate.contractAddress || crate.contractAddress === "0x0000000000000000000000000000000000000000") {
        return {
          crateId: crate.id,
          crateName: crate.name,
          ticker: crate.ticker,
          category: crate.category,
          balance: 0,
          value: 0,
          pnl: 0,
          pnlPercent: 0,
          costBasis: 0
        };
      }
      const contract = new ethers.Contract(crate.contractAddress, erc20Abi, provider);
      const [balanceRaw, decimals] = await Promise.all([
        contract.balanceOf(wallet),
        contract.decimals()
      ]);
      const balance = Number(ethers.formatUnits(balanceRaw, decimals));
      const price = prices.get(crate.id) ?? 0;
      const value = balance * price;

      let pnl = 0;
      let pnlPercent = 0;
      let costBasis = 0;

      if (balance > 0) {
        const [mintLogs, burnLogs] = await Promise.all([
          contract.queryFilter(contract.filters.Minted(wallet), crateFromBlock, "latest"),
          contract.queryFilter(contract.filters.Burned(wallet), crateFromBlock, "latest")
        ]);

        let totalTokens = 0;
        let costUsd = 0;

        for (const log of mintLogs) {
          if (!("args" in log) || !log.args) continue;
          const args = log.args as unknown as { ethIn?: bigint; tokensOut?: bigint; feeEth?: bigint } & Array<unknown>;
          const ethIn = (args.ethIn ?? args[1]) as bigint;
          const tokensOut = (args.tokensOut ?? args[2]) as bigint;
          const feeEth = (args.feeEth ?? args[3]) as bigint;
          const netEth = ethIn - feeEth;
          const ts = await getBlockTimestamp(log.blockNumber);
          const ethUsdAt = getPriceAt("eth-usd", ts, ethUsdPriceNow);
          costUsd += Number(ethers.formatEther(netEth)) * ethUsdAt;
          totalTokens += Number(ethers.formatUnits(tokensOut, decimals));
        }

        for (const log of burnLogs) {
          if (!("args" in log) || !log.args) continue;
          const args = log.args as unknown as { tokensIn?: bigint; ethOut?: bigint; feeEth?: bigint } & Array<unknown>;
          const tokensIn = (args.tokensIn ?? args[1]) as bigint;
          const ethOut = (args.ethOut ?? args[2]) as bigint;
          const ts = await getBlockTimestamp(log.blockNumber);
          const ethUsdAt = getPriceAt("eth-usd", ts, ethUsdPriceNow);
          costUsd -= Number(ethers.formatEther(ethOut)) * ethUsdAt;
          totalTokens -= Number(ethers.formatUnits(tokensIn, decimals));
        }

        if (totalTokens > 0 && costUsd > 0) {
          const averageCost = costUsd / totalTokens;
          costBasis = averageCost * balance;
          pnl = value - costBasis;
          pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
        }
      }

      return {
        crateId: crate.id,
        crateName: crate.name,
        ticker: crate.ticker,
        category: crate.category,
        balance,
        value,
        pnl,
        pnlPercent,
        costBasis
      };
    })
  );

  const filtered = positionsWithCost.filter((pos) => pos.balance > 0);
  const totalValue = filtered.reduce((acc, pos) => acc + pos.value, 0);
  const totalCostBasis = filtered.reduce((acc, pos) => acc + (pos.costBasis ?? 0), 0);
  const totalPnl = filtered.reduce((acc, pos) => acc + pos.pnl, 0);
  const totalPnlPercent = totalCostBasis > 0 ? (totalPnl / totalCostBasis) * 100 : 0;

  res.json({
    totalValue,
    totalPnl,
    totalPnlPercent,
    positions: filtered.map(({ costBasis, ...pos }) => pos)
  });
});

app.get("/api/staking", async (req, res) => {
  const wallet = typeof req.query.wallet === "string" ? req.query.wallet : DEFAULT_WALLET;
  if (!staking || !stakingAddress || !ethers.isAddress(wallet)) {
    res.json({ walletAddress: wallet, stakedBalance: 0, positions: [], lastPositionId: null });
    return;
  }

  const fromBlock = Number(process.env.STAKING_DEPLOY_BLOCK || 0);
  const summary = await buildStakingSummary(staking, wallet, fromBlock);

  res.json({
    walletAddress: wallet,
    stakedBalance: summary.stakedBalance,
    positions: summary.positions,
    lastPositionId: summary.lastPositionId
  });
});

app.get("/api/base-staking", async (req, res) => {
  const wallet = typeof req.query.wallet === "string" ? req.query.wallet : DEFAULT_WALLET;
  if (!baseStaking || !baseStakingAddress || !ethers.isAddress(wallet)) {
    res.json({ walletAddress: wallet, stakedBalance: 0, positions: [], lastPositionId: null });
    return;
  }

  const fromBlock = Number(process.env.BASE_STAKING_DEPLOY_BLOCK || 0);
  const summary = await buildStakingSummary(baseStaking, wallet, fromBlock);

  res.json({
    walletAddress: wallet,
    stakedBalance: summary.stakedBalance,
    positions: summary.positions,
    lastPositionId: summary.lastPositionId
  });
});

app.get("/api/bridge/status", (_req, res) => {
  res.json(BRIDGE_STATUS);
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`ZenCrates backend listening on :${port}`);
});
