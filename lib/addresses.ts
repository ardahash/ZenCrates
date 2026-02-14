import addressesJson from "@/frontend-bridge/addresses.json";

export interface ChainAddresses {
  name: string;
  chainId: number;
  cratesToken?: string;
  zenToken?: string;
  zenStaking?: string;
  staking?: string;
  feeRebateController?: string;
  signedPriceOracle?: string;
  chainlinkOracle?: string;
  crateFactory?: string;
  presale?: string;
  governor?: string;
  timelock?: string;
  wrappedCrates?: string;
  crates?: Record<string, string>;
  baseStaking?: string;
}

interface AddressesFile {
  lastUpdated?: string;
  [chainId: string]: ChainAddresses | string | undefined;
}

const raw = addressesJson as AddressesFile;

export const LAST_UPDATED = (raw.lastUpdated as string | undefined) || "";

export const CHAIN_IDS = {
  HORIZEN_L3: 26514,
  BASE: 8453,
} as const;

export function getChainAddresses(chainId: number): ChainAddresses | undefined {
  return raw[String(chainId)] as ChainAddresses | undefined;
}

export const L3_ADDRESSES = getChainAddresses(CHAIN_IDS.HORIZEN_L3);
export const BASE_ADDRESSES = getChainAddresses(CHAIN_IDS.BASE);
