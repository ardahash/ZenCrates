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
const erc20Abi = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)"
];
const stakingAbi = ["function stakedBalanceOf(address) view returns (uint256)"];
const rebateAbi = [
  "function tiers() view returns ((uint256 minAmount,uint16 rebateBps)[])",
  "function maxRebateBps() view returns (uint16)"
];

const oracle = oracleAddress ? new ethers.Contract(oracleAddress, oracleAbi, provider) : null;
const stakingAddress = TOKEN_META.staking?.contractAddress || "";
const staking = stakingAddress ? new ethers.Contract(stakingAddress, stakingAbi, provider) : null;
const rebateController = rebateControllerAddress
  ? new ethers.Contract(rebateControllerAddress, rebateAbi, provider)
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

const defaultTierLabels = TIERS.map((tier) => tier.label);

let cachedTiers: { data: typeof TIERS; fetchedAt: number } | null = null;

function normalizeCrateId(id: string) {
  return id.startsWith("0x") && id.length === 66 ? id : ethers.id(id);
}

async function fetchOraclePrice(crateId: string) {
  if (!oracle) return { price: 0n, timestamp: 0 };
  const [price, timestamp] = await oracle.getPrice(normalizeCrateId(crateId));
  return { price: BigInt(price), timestamp: Number(timestamp) };
}

function formatPrice(raw: bigint, decimals: number) {
  if (raw === 0n) return 0;
  return Number(ethers.formatUnits(raw, decimals));
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

function computeChange24h(crateId: string, currentPrice: number) {
  if (!currentPrice) return 0;
  const history = getHistory(crateId);
  if (history.length === 0) return 0;
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const past = [...history].reverse().find((entry) => entry.timestamp * 1000 <= cutoff);
  if (!past) return 0;
  const pastPrice = Number(past.price);
  if (!pastPrice) return 0;
  return ((currentPrice - pastPrice) / pastPrice) * 100;
}

async function computeTvl(crateAddress: string, ethUsdPriceRaw: bigint) {
  if (!crateAddress || crateAddress === "0x0000000000000000000000000000000000000000") return 0;
  const balance = await provider.getBalance(crateAddress);
  if (balance === 0n || ethUsdPriceRaw === 0n) return 0;
  const usdValueScaled = (balance * ethUsdPriceRaw) / 10n ** 18n;
  return Number(ethers.formatUnits(usdValueScaled, ethPriceDecimals));
}

function resolveTier(balance: number, tiers: typeof TIERS) {
  let current = tiers[0] ?? {
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

async function fetchTierRules() {
  if (!rebateController) return TIERS;
  const now = Date.now();
  if (cachedTiers && now - cachedTiers.fetchedAt < 30_000) {
    return cachedTiers.data;
  }

  const rawTiers: Array<{ minAmount: bigint; rebateBps: number }> = await rebateController.tiers();
  const mapped = rawTiers.map((tier, index) => {
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
  const ethUsd = await fetchOraclePrice(ethOracleId);

  const crates = await Promise.all(
    CRATES.map(async (crate) => {
      const price = await fetchOraclePrice(crate.id);
      const currentPrice = formatPrice(price.price, priceDecimals);
      const priceChange24h = computeChange24h(crate.id, currentPrice);
      const tvl = await computeTvl(crate.contractAddress, ethUsd.price);

      return {
        ...crate,
        currentPrice,
        priceChange24h,
        tvl,
        collateralType: "ETH"
      };
    })
  );

  res.json({ crates });
});

app.get("/api/crates/:id", async (req, res) => {
  const crate = CRATES.find((item) => item.id === req.params.id);
  if (!crate) {
    res.status(404).json({ error: "Crate not found" });
    return;
  }

  const price = await fetchOraclePrice(crate.id);
  const currentPrice = formatPrice(price.price, priceDecimals);
  const priceChange24h = computeChange24h(crate.id, currentPrice);
  const ethUsd = await fetchOraclePrice(ethOracleId);
  const tvl = await computeTvl(crate.contractAddress, ethUsd.price);

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
      collateralType: "ETH"
    },
    priceHistory
  });
});

app.get("/api/prices", async (_req, res) => {
  const prices = await Promise.all(
    CRATES.map(async (crate) => {
      const price = await fetchOraclePrice(crate.id);
      const formatted = formatPrice(price.price, priceDecimals);
      return {
        crateId: crate.id,
        ticker: crate.ticker,
        price: formatted,
        change24h: computeChange24h(crate.id, formatted),
        timestamp: Date.now()
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

  const prices = new Map<string, number>();
  for (const crate of CRATES) {
    const price = await fetchOraclePrice(crate.id);
    prices.set(crate.id, formatPrice(price.price, priceDecimals));
  }

  const positions = await Promise.all(
    CRATES.map(async (crate) => {
      if (!crate.contractAddress || crate.contractAddress === "0x0000000000000000000000000000000000000000") {
        return {
          crateId: crate.id,
          crateName: crate.name,
          ticker: crate.ticker,
          category: crate.category,
          balance: 0,
          value: 0,
          pnl: 0,
          pnlPercent: 0
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
      return {
        crateId: crate.id,
        crateName: crate.name,
        ticker: crate.ticker,
        category: crate.category,
        balance,
        value,
        pnl: 0,
        pnlPercent: 0
      };
    })
  );

  const filtered = positions.filter((pos) => pos.balance > 0);
  const totalValue = filtered.reduce((acc, pos) => acc + pos.value, 0);

  res.json({
    totalValue,
    totalPnl: 0,
    totalPnlPercent: 0,
    positions: filtered
  });
});

app.get("/api/bridge/status", (_req, res) => {
  res.json(BRIDGE_STATUS);
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`ZenCrates backend listening on :${port}`);
});