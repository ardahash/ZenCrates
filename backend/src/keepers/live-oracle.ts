import "dotenv/config";
import { ethers } from "ethers";
import fs from "fs";
import path from "path";

type PriceMap = Record<string, string>;

const rpcUrl = process.env.ORACLE_RPC_URL || process.env.HORIZEN_L3_RPC_URL || "";
const contractAddress =
  process.env.ORACLE_CONTRACT_ADDRESS || process.env.PRICE_ORACLE_ADDRESS || "";
const privateKey = process.env.ORACLE_PRIVATE_KEY || "";
const priceDecimals = Number(process.env.ORACLE_PRICE_DECIMALS || 8);

if (!rpcUrl || !contractAddress || !privateKey) {
  throw new Error("Missing ORACLE_RPC_URL, ORACLE_CONTRACT_ADDRESS, or ORACLE_PRIVATE_KEY");
}

const blsApiKey = process.env.BLS_API_KEY || "";
const blsCpiSeries = process.env.BLS_CPI_SERIES || "CUUR0000SA0";

const massiveApiKey = process.env.MASSIVE_API_KEY || process.env.apiKey || "";
const massiveBaseUrl = process.env.MASSIVE_BASE_URL || "https://api.massive.com";
const massiveTickerMapInput = process.env.MASSIVE_TICKER_MAP || "";

const baseRpcUrl = process.env.BASE_RPC_URL || "https://mainnet.base.org";
const chainlinkEthFeed =
  process.env.CHAINLINK_ETH_USD_FEED ||
  "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70";
const chainlinkBtcFeed =
  process.env.CHAINLINK_BTC_USD_FEED ||
  "0x64c911996D3c6aC71f9b455B1E8E7266BcbD848F";

const treasuryRateXmlUrl =
  process.env.TREASURY_RATE_XML_URL ||
  process.env.TREASURY_YIELD_XML_URL ||
  `https://home.treasury.gov/resource-center/data-chart-center/interest-rates/pages/xml?data=daily_treasury_yield_curve&field_tdr_date_value=${new Date().getUTCFullYear()}`;

const treasuryRealRateXmlUrl =
  process.env.TREASURY_REAL_RATE_XML_URL ||
  process.env.TREASURY_REAL_YIELD_XML_URL ||
  `https://home.treasury.gov/resource-center/data-chart-center/interest-rates/pages/xml?data=daily_treasury_real_yield_curve&field_tdr_date_value=${new Date().getUTCFullYear()}`;

const provider = new ethers.JsonRpcProvider(rpcUrl);
const wallet = new ethers.Wallet(privateKey, provider);
const baseProvider = new ethers.JsonRpcProvider(baseRpcUrl);

const abi = [
  "function updatePrice((bytes32 crateId,uint256 price,uint64 timestamp,uint64 nonce) update, bytes[] signatures)",
  "function latestData(bytes32 crateId) view returns (uint256 price,uint64 timestamp,uint64 nonce)"
];

const domain = {
  name: "ZenCrates Oracle",
  version: "1",
  chainId: (await provider.getNetwork()).chainId,
  verifyingContract: contractAddress
};

const types = {
  PriceUpdate: [
    { name: "crateId", type: "bytes32" },
    { name: "price", type: "uint256" },
    { name: "timestamp", type: "uint64" },
    { name: "nonce", type: "uint64" }
  ]
};

const contract = new ethers.Contract(contractAddress, abi, wallet);

const historyPath =
  process.env.ORACLE_HISTORY_PATH ||
  path.resolve(process.cwd(), "data", "oracle-history.json");

const defaultMassiveTickerMap: Record<string, string> = {
  "sp500-index": "I:SPX",
  "macro-stress": "I:VIX",
  "btc-momentum": "X:BTCUSD",
  "eth-usd": "X:ETHUSD"
};

function parsePrice(value: string) {
  return ethers.parseUnits(value, priceDecimals);
}

function parseMassiveTickerMap(input: string) {
  const map: Record<string, string> = {};
  if (!input) return map;
  for (const entry of input.split(",")) {
    const trimmed = entry.trim();
    if (!trimmed) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex <= 0) continue;
    const crateId = trimmed.slice(0, eqIndex).trim();
    const ticker = trimmed.slice(eqIndex + 1).trim();
    if (!crateId || !ticker) continue;
    map[crateId] = ticker;
  }
  return map;
}

async function fetchMassiveIndices(tickers: string[]) {
  if (!massiveApiKey) {
    throw new Error("Missing MASSIVE_API_KEY.");
  }
  if (tickers.length === 0) {
    return new Map<string, number>();
  }
  const params = new URLSearchParams();
  params.set("ticker.any_of", tickers.join(","));
  params.set("limit", String(Math.min(tickers.length, 250)));
  params.set("apiKey", massiveApiKey);
  const url = `${massiveBaseUrl}/v3/snapshot/indices?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Massive indices snapshot failed ${response.status}: ${response.statusText}`);
  }
  const data = await response.json();
  const results = Array.isArray(data?.results) ? data.results : [];
  const map = new Map<string, number>();
  for (const item of results) {
    const ticker = item?.ticker;
    const value = Number(item?.value);
    if (typeof ticker === "string" && Number.isFinite(value)) {
      map.set(ticker, value);
    }
  }
  return map;
}

function appendHistory(crateId: string, price: bigint, timestamp: bigint) {
  const formatted = Number(ethers.formatUnits(price, priceDecimals));
  let existing: { entries?: Record<string, Array<{ timestamp: number; price: string }>> } = {};

  if (fs.existsSync(historyPath)) {
    const raw = fs.readFileSync(historyPath, "utf8");
    if (raw.trim()) {
      try {
        existing = JSON.parse(raw);
      } catch {
        existing = {};
      }
    }
  }

  const entries = existing.entries ?? {};
  const list = entries[crateId] ?? [];
  list.push({ timestamp: Number(timestamp), price: formatted.toString() });

  const cutoff = Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 45;
  const trimmed = list.filter((entry) => entry.timestamp >= cutoff);

  entries[crateId] = trimmed;
  existing.entries = entries;

  fs.mkdirSync(path.dirname(historyPath), { recursive: true });
  fs.writeFileSync(historyPath, JSON.stringify(existing, null, 2));
}

async function fetchBlsCpi(): Promise<{ cpiLevel: number; cpiYoy: number }> {
  const endYear = new Date().getUTCFullYear();
  const startYear = endYear - 2;
  const url = "https://api.bls.gov/publicAPI/v2/timeseries/data/";
  const body: Record<string, unknown> = {
    seriesid: [blsCpiSeries],
    startyear: startYear.toString(),
    endyear: endYear.toString()
  };
  if (blsApiKey) {
    body.registrationKey = blsApiKey;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    throw new Error(`BLS request failed ${response.status}: ${response.statusText}`);
  }
  const data = await response.json();
  const series = data?.Results?.series?.[0]?.data;
  if (!Array.isArray(series) || series.length === 0) {
    throw new Error("BLS returned no CPI data.");
  }

  const monthly = series.filter((item: { period: string }) => item.period?.startsWith("M"));
  const latest = monthly[0];
  if (!latest) {
    throw new Error("BLS CPI series missing latest monthly value.");
  }
  const latestValue = Number(latest.value);
  const targetYear = String(Number(latest.year) - 1);
  const targetPeriod = latest.period;
  const previous = monthly.find(
    (item: { year: string; period: string }) =>
      item.year === targetYear && item.period === targetPeriod
  );
  if (!previous) {
    throw new Error("BLS CPI series missing prior-year comparison.");
  }
  const previousValue = Number(previous.value);
  const cpiYoy = ((latestValue / previousValue) - 1) * 100;

  return { cpiLevel: latestValue, cpiYoy };
}

function parseTreasuryLatest(xml: string, fields: string[]): Record<string, number> {
  const entries = xml.split("<entry>").slice(1);
  if (entries.length === 0) {
    throw new Error("Treasury XML feed contained no entries.");
  }
  const lastEntry = entries[entries.length - 1];
  const values: Record<string, number> = {};
  for (const field of fields) {
    const regex = new RegExp(`<d:${field}[^>]*>([^<]+)</d:${field}>`);
    const match = lastEntry.match(regex);
    if (!match) {
      throw new Error(`Treasury XML feed missing ${field}`);
    }
    values[field] = Number(match[1]);
  }
  return values;
}

async function fetchTreasuryRates(): Promise<{ threeMonth: number; tenYear: number }> {
  const response = await fetch(treasuryRateXmlUrl);
  if (!response.ok) {
    throw new Error(`Treasury rate feed failed ${response.status}: ${response.statusText}`);
  }
  const xml = await response.text();
  const values = parseTreasuryLatest(xml, ["BC_3MONTH", "BC_10YEAR"]);
  return { threeMonth: values.BC_3MONTH, tenYear: values.BC_10YEAR };
}

async function fetchTreasuryRealRate(): Promise<number> {
  const response = await fetch(treasuryRealRateXmlUrl);
  if (!response.ok) {
    throw new Error(`Treasury real rate feed failed ${response.status}: ${response.statusText}`);
  }
  const xml = await response.text();
  const values = parseTreasuryLatest(xml, ["TC_10YEAR"]);
  return values.TC_10YEAR;
}

async function fetchChainlinkPrice(feedAddress: string): Promise<string> {
  const feedAbi = [
    "function latestRoundData() view returns (uint80 roundId,int256 answer,uint256 startedAt,uint256 updatedAt,uint80 answeredInRound)",
    "function decimals() view returns (uint8)"
  ];
  const feed = new ethers.Contract(feedAddress, feedAbi, baseProvider);
  const latest = await feed.latestRoundData();
  const decimals = await feed.decimals();
  if (latest.answer <= 0) {
    throw new Error(`Chainlink feed ${feedAddress} returned invalid price`);
  }
  return ethers.formatUnits(latest.answer, decimals);
}

async function buildPrices(): Promise<PriceMap> {
  const prices: PriceMap = {};
  const massiveTickerMap = {
    ...defaultMassiveTickerMap,
    ...parseMassiveTickerMap(massiveTickerMapInput)
  };
  const massiveTickers = Array.from(new Set(Object.values(massiveTickerMap)));
  let massivePrices = new Map<string, number>();
  if (massiveApiKey && massiveTickers.length > 0) {
    try {
      massivePrices = await fetchMassiveIndices(massiveTickers);
    } catch (error) {
      console.warn("Massive indices fetch failed, falling back to other sources.", error);
    }
  }

  const [ethPrice, btcPrice] = await Promise.all([
    fetchChainlinkPrice(chainlinkEthFeed),
    fetchChainlinkPrice(chainlinkBtcFeed)
  ]);

  const ethMassiveTicker = massiveTickerMap["eth-usd"];
  const btcMassiveTicker = massiveTickerMap["btc-momentum"];
  prices["eth-usd"] =
    ethMassiveTicker && massivePrices.has(ethMassiveTicker)
      ? massivePrices.get(ethMassiveTicker)!.toString()
      : ethPrice;
  prices["btc-momentum"] =
    btcMassiveTicker && massivePrices.has(btcMassiveTicker)
      ? massivePrices.get(btcMassiveTicker)!.toString()
      : btcPrice;

  const [{ cpiLevel }, treasury, realRate] = await Promise.all([
    fetchBlsCpi(),
    fetchTreasuryRates(),
    fetchTreasuryRealRate()
  ]);

  prices["inflation-hedge"] = cpiLevel.toFixed(3);
  prices["treasury-index"] = treasury.threeMonth.toFixed(3);
  const sp500MassiveTicker = massiveTickerMap["sp500-index"];
  prices["sp500-index"] =
    sp500MassiveTicker && massivePrices.has(sp500MassiveTicker)
      ? massivePrices.get(sp500MassiveTicker)!.toString()
      : treasury.tenYear.toFixed(3);

  const macroStressTicker = massiveTickerMap["macro-stress"];
  if (macroStressTicker && massivePrices.has(macroStressTicker)) {
    prices["macro-stress"] = massivePrices.get(macroStressTicker)!.toString();
  } else {
    const curveInversion = Math.max(0, treasury.threeMonth - treasury.tenYear);
    prices["macro-stress"] = (100 + curveInversion * 10).toFixed(3);
  }

  prices["zgold-index"] = (100 + realRate * 10).toFixed(3);

  return prices;
}

async function main() {
  const baseNonce = process.env.ORACLE_NONCE ? BigInt(process.env.ORACLE_NONCE) : 1n;
  const prices = await buildPrices();

  const ids = [
    "eth-usd",
    "zgold-index",
    "inflation-hedge",
    "macro-stress",
    "sp500-index",
    "btc-momentum",
    "treasury-index"
  ];

  for (let i = 0; i < ids.length; i++) {
    const crateId = ids[i];
    const price = prices[crateId];
    if (!price) {
      throw new Error(`Missing price for ${crateId}`);
    }

    const crateHash = ethers.id(crateId);
    const latest = await contract.latestData(crateHash);
    const prevNonce = BigInt(latest.nonce ?? 0);
    const targetNonce = prevNonce + 1n;
    const fallbackNonce = baseNonce + BigInt(i);
    const nextNonce = targetNonce > fallbackNonce ? targetNonce : fallbackNonce;

    const update = {
      crateId: crateHash,
      price: parsePrice(price),
      timestamp: BigInt(Math.floor(Date.now() / 1000)),
      nonce: nextNonce
    };

    const signature = await wallet.signTypedData(domain, types, update);

    const tx = await contract.updatePrice(update, [signature]);
    console.log(`Sent signed price update for ${crateId}:`, tx.hash);
    await tx.wait();

    appendHistory(crateId, update.price, update.timestamp);
  }

  console.log("All updates confirmed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
