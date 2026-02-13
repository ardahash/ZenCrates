import "dotenv/config";
import { ethers } from "ethers";
import fs from "fs";
import path from "path";

type OracleUpdate = {
  crateId: string;
  price: string | number | bigint;
  nonce?: string | number | bigint;
  timestamp?: string | number | bigint;
};

const rpcUrl = process.env.ORACLE_RPC_URL || "";
const contractAddress =
  process.env.ORACLE_CONTRACT_ADDRESS || process.env.PRICE_ORACLE_ADDRESS || "";
const privateKey = process.env.ORACLE_PRIVATE_KEY || "";
const priceDecimals = Number(process.env.ORACLE_PRICE_DECIMALS || 0);

if (!rpcUrl || !contractAddress || !privateKey) {
  throw new Error("Missing ORACLE_RPC_URL, ORACLE_CONTRACT_ADDRESS, or ORACLE_PRIVATE_KEY");
}

const baseNonce = process.env.ORACLE_NONCE ? BigInt(process.env.ORACLE_NONCE) : 1n;
const updatesJson = process.env.ORACLE_UPDATES_JSON || "";
const singleCrateId = process.env.ORACLE_CRATE_ID || "";
const singlePrice = process.env.ORACLE_PRICE || "";

const updates: OracleUpdate[] = updatesJson
  ? (JSON.parse(updatesJson) as OracleUpdate[])
  : singleCrateId && singlePrice
    ? [{ crateId: singleCrateId, price: singlePrice }]
    : [];

if (updates.length === 0) {
  throw new Error("Missing ORACLE_UPDATES_JSON or ORACLE_CRATE_ID/ORACLE_PRICE");
}

const provider = new ethers.JsonRpcProvider(rpcUrl);
const wallet = new ethers.Wallet(privateKey, provider);

const abi = [
  "function updatePrice((bytes32 crateId,uint256 price,uint64 timestamp,uint64 nonce) update, bytes[] signatures)"
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

function parsePrice(value: OracleUpdate["price"]) {
  if (typeof value === "bigint") return value;
  const asString = String(value);
  if (priceDecimals === 0) return BigInt(asString);
  return ethers.parseUnits(asString, priceDecimals);
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

for (let i = 0; i < updates.length; i++) {
  const update = updates[i];
  const crateId =
    update.crateId.startsWith("0x") && update.crateId.length === 66
      ? update.crateId
      : ethers.id(update.crateId);
  const price = parsePrice(update.price);
  const nonce = update.nonce !== undefined ? BigInt(update.nonce) : baseNonce + BigInt(i);
  const timestamp =
    update.timestamp !== undefined
      ? BigInt(update.timestamp)
      : BigInt(Math.floor(Date.now() / 1000));

  const value = { crateId, price, timestamp, nonce };
  const signature = await wallet.signTypedData(domain, types, value);

  const tx = await contract.updatePrice(value, [signature]);
  console.log(`Sent signed price update for ${update.crateId}:`, tx.hash);
  await tx.wait();

  appendHistory(update.crateId, price, timestamp);
}

console.log("All updates confirmed.");
