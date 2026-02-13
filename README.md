# ZenCrates

ZenCrates is a reg-light Web3 protocol on Horizen L3 with a Base representation.

CRATES is a utility token and not a security. It does not grant ownership rights,
cash payouts, or guaranteed price changes. Fee rebates are discounts/credits on
protocol fees and are governed by the DAO/timelock.

No RWA custody and no redemption for physical assets.
Open-data proxy crates are not official benchmarks or licensed indices.

**Key components**
- CRATES (ERC-20 + Permit) on Horizen L3.
- wCRATES (ERC-20) on Base with `MINTER_ROLE` controlled by a multisig/bridge-minter.
- Staking contract that mints sCRATES (ERC-721 positions). Ownership determines rebate eligibility and voting power.
- FeeRebateController with tiered rebate rules and caps.
- ExposureCrate and StrategyCrate fee logic with rebate discounting.
- ETH-collateral crate vaults for mint/burn (ETH-only collateral for now; USDC collateral planned once native USDC is available on Horizen L3).
- Open-data proxy indices (Treasury rate curves + CPI) or optional Massive minute aggregates (ETF/currency proxies).
- Governance: TimelockController + OpenZeppelin Governor wired to staking voting power.
- Oracle: Chainlink when available, otherwise SignedPriceOracle (EIP-712) with signer threshold, max age, and deviation guard.

**Networks (as of 2026-02-13)**
- Horizen L3 (Caldera appchain)
  - Chain ID: `26514`
  - RPC: `https://horizen.calderachain.xyz/http`
  - Explorer: `https://horizen.calderaexplorer.xyz`
  - Bridge Hub: `https://horizen.hub.caldera.xyz`
- Base mainnet
  - Chain ID: `8453`
  - RPC: `https://mainnet.base.org`
  - Explorer: `https://base.blockscout.com` (alt: `https://basescan.org`)

If you use a different RPC or testnet, update `.env` and `frontend-bridge/addresses.json` accordingly.

## Repository Layout
- `app/` and `components/`: Next.js frontend
- `backend/`: Node/TypeScript API service
- `contracts/`: Hardhat contracts, tests, and deploy scripts
- `frontend-bridge/addresses.json`: chainId -> addresses registry

## Setup

**Frontend**
```bash
npm install
npm run dev
```

Frontend env (`.env.local`):
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` (WalletConnect Cloud project id)
- `NEXT_PUBLIC_ADMIN_ADDRESS` (optional, enables admin UI for that address)
- `NEXT_PUBLIC_BACKEND_URL` (optional, defaults to `http://localhost:4000`)

**Backend**
```bash
cd backend
npm install
npm run dev
```

Backend env (`backend/.env`):
- `HORIZEN_L3_RPC_URL` (or `BACKEND_RPC_URL`)
- `PRICE_ORACLE_ADDRESS` (SignedPriceOracle on L3)
- `ORACLE_PRICE_DECIMALS` (use `8` for USD-style prices)
- `ETH_USD_ORACLE_ID` (default: `eth-usd`)
- `ORACLE_HISTORY_PATH` (optional, defaults to `backend/data/oracle-history.json`)
- `FEE_REBATE_CONTROLLER_ADDRESS` (FeeRebateController on L3)
- `BLS_API_KEY` (optional; higher rate limits)
- `BLS_CPI_SERIES` (default `CUUR0000SA0`)
- `BASE_RPC_URL` (defaults to `https://mainnet.base.org`)
- `CHAINLINK_ETH_USD_FEED` (default Base feed address)
- `CHAINLINK_BTC_USD_FEED` (default Base feed address)
- `TREASURY_RATE_XML_URL` (optional override for Treasury rate curve XML)
- `TREASURY_REAL_RATE_XML_URL` (optional override for Treasury real rate XML)
- `MASSIVE_API_KEY` (optional; enables Massive indices/stock snapshots)
- `MASSIVE_BASE_URL` (default: `https://api.massive.com`)
- `MASSIVE_TICKER_MAP` (optional mapping: `crateId=ticker,...`)
- `MASSIVE_THROTTLE_MS` (optional, default `12000`; used to avoid rate limits)
- `STAKING_DEPLOY_BLOCK` (optional; improves staking event scan performance)

**Contracts**
```bash
cd contracts
npm install
npm run compile
npm test
```

## Dependency Resolution (date-fns / react-day-picker)
A previous peer dependency conflict was caused by `date-fns@4` with `react-day-picker@8`.
This repo now uses `react-day-picker@9.10.0`, which aligns with `date-fns@4`.

If you still hit an `ERESOLVE` error:
- Confirm `react-day-picker@9.10.0` and `date-fns@4.1.0` in `package.json`.
- Re-run `npm install`.
- Fallback (only if needed): `npm install --legacy-peer-deps`.

## Deployments

### Horizen L3 (canonical)
```bash
cd contracts
npm run deploy:l3
```
Deploys CRATES, StakedCrates (sCRATES), FeeRebateController, SignedPriceOracle,
ChainlinkPriceOracle, CrateFactory, sample Exposure/Strategy crates, Timelock,
and Governor.

### Base (representation)
```bash
cd contracts
npm run deploy:base
```
Deploys wCRATES with `MINTER_ROLE` controlled by the multisig or bridge-minter.

### Presale (fixed price)
```bash
cd contracts
npm run deploy:presale
```
Deploys the fixed-price CRATES presale on Horizen L3 and updates
`frontend-bridge/addresses.json` with the presale address.

### Deploy ETH-collateral crates (reuse existing L3 deployment)
```bash
cd contracts
npm run deploy:eth-crates
```
Deploys ETH-collateral crate vaults without redeploying CRATES/staking/oracles,
and updates `frontend-bridge/addresses.json` and `backend/src/data/crates.ts`.

### Set Fee Rebate Tiers (on-chain)
```bash
cd contracts
npm run set:tiers
```
Updates FeeRebateController tiers from the default tier table.

### Live Price Keeper (API -> oracle)
```bash
cd backend
npm run keeper:live
```
Fetches live market prices from external APIs and pushes signed updates to the
SignedPriceOracle. It also writes `backend/data/oracle-history.json` for charts
and 24h change calculations.

`keeper:live` pulls open-data macro series (CPI and Treasury rate curves) plus
on-chain Chainlink BTC/ETH prices from Base. If `MASSIVE_API_KEY` is set, it also
pulls Massive minute aggregates for any crate IDs mapped via `MASSIVE_TICKER_MAP`
(typically ETFs or FX pairs). The keeper writes oracle history for charts.
Set `BLS_API_KEY` for higher CPI rate limits.

Note: Massive index snapshots are gated by plan; the free plan may not include
the indices snapshot endpoint. ETF or FX proxies via minute aggregates work
with plans that include Minute Aggregates.

If you want backend token metadata to keep staking info from L3, set:
- `HORIZEN_STAKING_ADDRESS` (same as sCRATES contract)
- `HORIZEN_SCRATES_ADDRESS` (can match staking contract)

### Registry Outputs
Deploy scripts update:
- `frontend-bridge/addresses.json`
- `backend/src/data/token.ts`
- `backend/src/data/crates.ts`

## Bridging Strategy
The Horizen L3 stack provides a Caldera bridge hub for chain-level transfers.
Token-level bridging for CRATES is not assumed to be available yet, so this
repo deploys `wCRATES` on Base with a privileged minter (multisig/bridge-minter).

When an official bridge path is confirmed:
1. Deploy the official bridge or MetaToken configuration.
2. Assign `MINTER_ROLE` to the bridge minter and revoke from the deployer.
3. Migrate UI references from `wCRATES` to the official representation.

## Oracle Strategy
- Prefer Chainlink feeds when available on the target chain.
- Otherwise use `SignedPriceOracle`:
  - EIP-712 typed data
  - signer allowlist + threshold
  - staleness checks (`maxAge`)
  - optional deviation guard (`maxDeviationBps`)

Open-data proxy indices are derived from:
- U.S. Treasury rate curve XML feeds (nominal + real rates).
- BLS CPI-U series (`CUUR0000SA0`).
These proxies are not official benchmarks or licensed indices. If you configure
Massive, the keeper can source ETF or FX proxy prices via minute aggregates.

A keeper script is available at `backend/src/keepers/signed-oracle.ts` and uses
env vars for secure key handling.

Keeper notes:
- `ORACLE_CRATE_ID` must be a bytes32 id (for example: `ethers.id("zgold-index")`).
- For multiple updates, set `ORACLE_UPDATES_JSON` to a JSON array of updates
  with `crateId`, `price`, and optional `nonce`/`timestamp`. If `crateId` is not
  bytes32, it will be hashed via `ethers.id(...)`.

## Backend API
The backend serves the endpoints required by the frontend:
- `GET /api/token`
- `GET /api/tiers`
- `GET /api/rewards?wallet=0x...`
- `GET /api/crates`
- `GET /api/crates/:id`
- `GET /api/prices`
- `GET /api/portfolio`
- `GET /api/staking?wallet=0x...`
- `GET /api/bridge/status`

The Next.js API routes proxy these calls. Configure the base URL with:
- `BACKEND_URL` or `NEXT_PUBLIC_BACKEND_URL` (default: `http://localhost:4000`)

## Security Notes
- ReentrancyGuard + checks-effects-interactions in staking.
- AccessControl roles for admin, pauser, fee manager, and oracle signer admin.
- Pausable emergency stop for staking and crate fee logic.
- No RWA custody and no redemption for physical assets.

## Open-Data Sources
- BLS CPI-U series (`CUUR0000SA0`) via BLS public API.
- U.S. Treasury rate curve XML feeds (nominal + real rates).
These sources are used to compute proxy indices, not official benchmarks.

## Environment Files
- `contracts/.env.example`
- `backend/.env.example`

## License
MIT
