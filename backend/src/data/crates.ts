export const CRATES = [
  {
    "id": "zgold-index",
    "name": "Real Yield Anchor Index",
    "ticker": "zREAL",
    "description": "Open-data proxy anchored to the U.S. 10-year real rate curve.",
    "longDescription": "zREAL is a software-based proxy index derived from the U.S. Treasury real rate curve (10-year). It is not gold, not a benchmark, and does not represent physical custody or redemption.",
    "category": "exposure",
    "riskLevel": "medium",
    "collateralType": "ETH",
    "currentPrice": 0,
    "priceChange24h": 0,
    "tvl": 0,
    "fees": {
      "mint": 0.003,
      "burn": 0.003,
      "management": 0.005
    },
    "oracleSources": [
      {
        "name": "US Treasury Real Rate Curve (10Y)",
        "type": "off-chain",
        "endpoint": "home.treasury.gov/.../daily_treasury_real_rate_curve"
      },
      {
        "name": "Signed Oracle",
        "type": "off-chain",
        "endpoint": ""
      }
    ],
    "createdAt": "2025-06-01T00:00:00Z",
    "isActive": true,
    "contractAddress": "0xc4aF1e9Aa2D347669FCc09c90527A118D181e6E9",
    "explorerUrl": "https://horizen.calderaexplorer.xyz/address/0xc4aF1e9Aa2D347669FCc09c90527A118D181e6E9"
  },
  {
    "id": "inflation-hedge",
    "name": "CPI Anchor Index",
    "ticker": "zCPI",
    "description": "Open-data CPI-U index level as an inflation proxy.",
    "longDescription": "zCPI tracks the CPI-U index level from the Bureau of Labor Statistics. It is an open-data proxy index with no custody of assets or redemption rights.",
    "category": "exposure",
    "riskLevel": "medium",
    "collateralType": "ETH",
    "currentPrice": 0,
    "priceChange24h": 0,
    "tvl": 0,
    "fees": {
      "mint": 0.005,
      "burn": 0.005,
      "management": 0.01
    },
    "oracleSources": [
      {
        "name": "BLS CPI-U (CUUR0000SA0)",
        "type": "off-chain",
        "endpoint": "api.bls.gov/publicAPI/v2/timeseries/data"
      },
      {
        "name": "Signed Oracle",
        "type": "off-chain",
        "endpoint": ""
      }
    ],
    "createdAt": "2025-07-15T00:00:00Z",
    "isActive": true,
    "contractAddress": "0x308DAB7AD14D57AD6dd82f3A90fd8BB6c30d0972",
    "explorerUrl": "https://horizen.calderaexplorer.xyz/address/0x308DAB7AD14D57AD6dd82f3A90fd8BB6c30d0972"
  },
  {
    "id": "macro-stress",
    "name": "Curve Stress Index",
    "ticker": "zSTRESS",
    "description": "Open-data proxy derived from the 3M vs 10Y Treasury rate curve slope.",
    "longDescription": "zSTRESS is a software index that tracks rate curve inversion pressure using U.S. Treasury 3-month and 10-year rates. It is not an official volatility index or licensed benchmark.",
    "category": "strategy",
    "riskLevel": "high",
    "collateralType": "ETH",
    "currentPrice": 0,
    "priceChange24h": 0,
    "tvl": 0,
    "fees": {
      "mint": 0.005,
      "burn": 0.005,
      "management": 0.015
    },
    "oracleSources": [
      {
        "name": "US Treasury Rate Curve (3M/10Y)",
        "type": "off-chain",
        "endpoint": "home.treasury.gov/.../daily_treasury_rate_curve"
      },
      {
        "name": "Signed Oracle",
        "type": "off-chain",
        "endpoint": ""
      }
    ],
    "createdAt": "2025-08-01T00:00:00Z",
    "isActive": true,
    "contractAddress": "0x3BBaFCA2fFF4F2b510e77eae4302CF75Dd13e44C",
    "explorerUrl": "https://horizen.calderaexplorer.xyz/address/0x3BBaFCA2fFF4F2b510e77eae4302CF75Dd13e44C"
  },
  {
    "id": "sp500-index",
    "name": "Long Rate Momentum Index",
    "ticker": "zLONG",
    "description": "Open-data proxy anchored to the U.S. 10-year Treasury rate.",
    "longDescription": "zLONG is a software-based proxy index derived from the U.S. Treasury 10-year nominal rate. It is not an official equity benchmark or licensed index.",
    "category": "exposure",
    "riskLevel": "medium",
    "collateralType": "ETH",
    "currentPrice": 0,
    "priceChange24h": 0,
    "tvl": 0,
    "fees": {
      "mint": 0.003,
      "burn": 0.003,
      "management": 0.005
    },
    "oracleSources": [
      {
        "name": "US Treasury Rate Curve (10Y)",
        "type": "off-chain",
        "endpoint": "home.treasury.gov/.../daily_treasury_rate_curve"
      },
      {
        "name": "Signed Oracle",
        "type": "off-chain",
        "endpoint": ""
      }
    ],
    "createdAt": "2025-09-01T00:00:00Z",
    "isActive": true,
    "contractAddress": "0x9dCfe4aA2FFfCc3E554F464E6Ec5eD4610B5907e",
    "explorerUrl": "https://horizen.calderaexplorer.xyz/address/0x9dCfe4aA2FFfCc3E554F464E6Ec5eD4610B5907e"
  },
  {
    "id": "btc-momentum",
    "name": "Digital Momentum Index",
    "ticker": "zDIGI",
    "description": "Digital asset proxy referencing BTC/USD via on-chain oracles.",
    "longDescription": "zDIGI is a synthetic index that references BTC/USD via on-chain oracle feeds. It is a software-based proxy with no custody of BTC or physical assets.",
    "category": "strategy",
    "riskLevel": "high",
    "collateralType": "ETH",
    "currentPrice": 0,
    "priceChange24h": 0,
    "tvl": 0,
    "fees": {
      "mint": 0.004,
      "burn": 0.004,
      "management": 0.012
    },
    "oracleSources": [
      {
        "name": "Chainlink BTC/USD (Base)",
        "type": "on-chain",
        "endpoint": "basescan.org/address/0x64c911996D3c6aC71f9b455B1E8E7266BcbD848F"
      },
      {
        "name": "Signed Oracle",
        "type": "off-chain",
        "endpoint": ""
      }
    ],
    "createdAt": "2025-10-01T00:00:00Z",
    "isActive": true,
    "contractAddress": "0xc61139aD1ad4D01f717de54120d30F8a8286AfCB",
    "explorerUrl": "https://horizen.calderaexplorer.xyz/address/0xc61139aD1ad4D01f717de54120d30F8a8286AfCB"
  },
  {
    "id": "treasury-index",
    "name": "Short Rate Index",
    "ticker": "zSHORT",
    "description": "Open-data proxy anchored to the U.S. 3-month Treasury rate.",
    "longDescription": "zSHORT tracks the U.S. Treasury 3-month rate as an open-data proxy index. It is a synthetic exposure tool with no custody of securities.",
    "category": "exposure",
    "riskLevel": "low",
    "collateralType": "ETH",
    "currentPrice": 0,
    "priceChange24h": 0,
    "tvl": 0,
    "fees": {
      "mint": 0.002,
      "burn": 0.002,
      "management": 0.003
    },
    "oracleSources": [
      {
        "name": "US Treasury Rate Curve (3M)",
        "type": "off-chain",
        "endpoint": "home.treasury.gov/.../daily_treasury_rate_curve"
      },
      {
        "name": "Signed Oracle",
        "type": "off-chain",
        "endpoint": ""
      }
    ],
    "createdAt": "2025-11-01T00:00:00Z",
    "isActive": true,
    "contractAddress": "0x5CD2969eF4Fe33375D4dF762dbC124837C6eBaa4",
    "explorerUrl": "https://horizen.calderaexplorer.xyz/address/0x5CD2969eF4Fe33375D4dF762dbC124837C6eBaa4"
  }
] as const;
