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
    "contractAddress": "0x73836d794555705f47B1F66785AFaEeB1785Dc66",
    "explorerUrl": "https://horizen.calderaexplorer.xyz/address/0x73836d794555705f47B1F66785AFaEeB1785Dc66"
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
    "contractAddress": "0xc1Ae50Aa5fc1a9E066cD7F52297b3EC8aBD806Ff",
    "explorerUrl": "https://horizen.calderaexplorer.xyz/address/0xc1Ae50Aa5fc1a9E066cD7F52297b3EC8aBD806Ff"
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
    "contractAddress": "0x8984F3871bcF8E374Af6e1Eb8300999017185Ac6",
    "explorerUrl": "https://horizen.calderaexplorer.xyz/address/0x8984F3871bcF8E374Af6e1Eb8300999017185Ac6"
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
    "contractAddress": "0x033213a17d39BFb6F21Cab62d2A5451eD82f1e3b",
    "explorerUrl": "https://horizen.calderaexplorer.xyz/address/0x033213a17d39BFb6F21Cab62d2A5451eD82f1e3b"
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
    "contractAddress": "0x6Ef186d6B8Bdb621BA19AA4d654f9aA5BD49662B",
    "explorerUrl": "https://horizen.calderaexplorer.xyz/address/0x6Ef186d6B8Bdb621BA19AA4d654f9aA5BD49662B"
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
    "contractAddress": "0x7d78f38e3223042d7097D4305B7cC914468613D1",
    "explorerUrl": "https://horizen.calderaexplorer.xyz/address/0x7d78f38e3223042d7097D4305B7cC914468613D1"
  },
  {
    "id": "equity-large",
    "name": "US Equity Proxy",
    "ticker": "zSPY",
    "description": "ETF price proxy for broad US equities (SPY).",
    "longDescription": "zSPY is a synthetic proxy based on SPY ETF price data. It does not represent ownership of the ETF or any custody or redemption rights.",
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
        "name": "Massive Minute Aggregates (SPY)",
        "type": "off-chain",
        "endpoint": "api.massive.com/v2/aggs/ticker/SPY/range/1/minute"
      },
      {
        "name": "Signed Oracle",
        "type": "off-chain",
        "endpoint": ""
      }
    ],
    "createdAt": "2026-02-13T00:00:00Z",
    "isActive": true,
    "contractAddress": "0xa4c0f1a16fb962E8EfED2936C9020d0a78f24760",
    "explorerUrl": "https://horizen.calderaexplorer.xyz/address/0xa4c0f1a16fb962E8EfED2936C9020d0a78f24760"
  },
  {
    "id": "equity-tech",
    "name": "US Tech Equity Proxy",
    "ticker": "zQQQ",
    "description": "ETF price proxy for US tech equities (QQQ).",
    "longDescription": "zQQQ is a synthetic proxy based on QQQ ETF price data. It does not represent ownership of the ETF or any custody or redemption rights.",
    "category": "exposure",
    "riskLevel": "medium",
    "collateralType": "ETH",
    "currentPrice": 0,
    "priceChange24h": 0,
    "tvl": 0,
    "fees": {
      "mint": 0.003,
      "burn": 0.003,
      "management": 0.006
    },
    "oracleSources": [
      {
        "name": "Massive Minute Aggregates (QQQ)",
        "type": "off-chain",
        "endpoint": "api.massive.com/v2/aggs/ticker/QQQ/range/1/minute"
      },
      {
        "name": "Signed Oracle",
        "type": "off-chain",
        "endpoint": ""
      }
    ],
    "createdAt": "2026-02-13T00:00:00Z",
    "isActive": true,
    "contractAddress": "0x8207318D36D706226A4d90216DB7C6949Ea3B3E3",
    "explorerUrl": "https://horizen.calderaexplorer.xyz/address/0x8207318D36D706226A4d90216DB7C6949Ea3B3E3"
  },
  {
    "id": "equity-bluechip",
    "name": "US Blue-Chip Equity Proxy",
    "ticker": "zDIA",
    "description": "ETF price proxy for US blue-chip equities (DIA).",
    "longDescription": "zDIA is a synthetic proxy based on DIA ETF price data. It does not represent ownership of the ETF or any custody or redemption rights.",
    "category": "exposure",
    "riskLevel": "medium",
    "collateralType": "ETH",
    "currentPrice": 0,
    "priceChange24h": 0,
    "tvl": 0,
    "fees": {
      "mint": 0.003,
      "burn": 0.003,
      "management": 0.006
    },
    "oracleSources": [
      {
        "name": "Massive Minute Aggregates (DIA)",
        "type": "off-chain",
        "endpoint": "api.massive.com/v2/aggs/ticker/DIA/range/1/minute"
      },
      {
        "name": "Signed Oracle",
        "type": "off-chain",
        "endpoint": ""
      }
    ],
    "createdAt": "2026-02-13T00:00:00Z",
    "isActive": true,
    "contractAddress": "0x0d614eEeee8DFb72a53627a0dc22B9602FF2EF70",
    "explorerUrl": "https://horizen.calderaexplorer.xyz/address/0x0d614eEeee8DFb72a53627a0dc22B9602FF2EF70"
  },
  {
    "id": "metal-gold",
    "name": "Gold Proxy",
    "ticker": "zGLD",
    "description": "ETF price proxy for gold (GLD).",
    "longDescription": "zGLD is a synthetic proxy based on GLD ETF price data. It does not represent ownership of the ETF or any custody or redemption rights.",
    "category": "exposure",
    "riskLevel": "medium",
    "collateralType": "ETH",
    "currentPrice": 0,
    "priceChange24h": 0,
    "tvl": 0,
    "fees": {
      "mint": 0.003,
      "burn": 0.003,
      "management": 0.006
    },
    "oracleSources": [
      {
        "name": "Massive Minute Aggregates (GLD)",
        "type": "off-chain",
        "endpoint": "api.massive.com/v2/aggs/ticker/GLD/range/1/minute"
      },
      {
        "name": "Signed Oracle",
        "type": "off-chain",
        "endpoint": ""
      }
    ],
    "createdAt": "2026-02-13T00:00:00Z",
    "isActive": true,
    "contractAddress": "0x31403A854538A7702eb1FEa4B219E1A40270fD2E",
    "explorerUrl": "https://horizen.calderaexplorer.xyz/address/0x31403A854538A7702eb1FEa4B219E1A40270fD2E"
  },
  {
    "id": "metal-silver",
    "name": "Silver Proxy",
    "ticker": "zSLV",
    "description": "ETF price proxy for silver (SLV).",
    "longDescription": "zSLV is a synthetic proxy based on SLV ETF price data. It does not represent ownership of the ETF or any custody or redemption rights.",
    "category": "exposure",
    "riskLevel": "medium",
    "collateralType": "ETH",
    "currentPrice": 0,
    "priceChange24h": 0,
    "tvl": 0,
    "fees": {
      "mint": 0.004,
      "burn": 0.004,
      "management": 0.006
    },
    "oracleSources": [
      {
        "name": "Massive Minute Aggregates (SLV)",
        "type": "off-chain",
        "endpoint": "api.massive.com/v2/aggs/ticker/SLV/range/1/minute"
      },
      {
        "name": "Signed Oracle",
        "type": "off-chain",
        "endpoint": ""
      }
    ],
    "createdAt": "2026-02-13T00:00:00Z",
    "isActive": true,
    "contractAddress": "0x4557887256b973beD60B4EC7600baFdB98d342f6",
    "explorerUrl": "https://horizen.calderaexplorer.xyz/address/0x4557887256b973beD60B4EC7600baFdB98d342f6"
  },
  {
    "id": "metal-copper",
    "name": "Copper Proxy",
    "ticker": "zCOP",
    "description": "ETF price proxy for copper (CPER).",
    "longDescription": "zCOP is a synthetic proxy based on CPER ETF price data. It does not represent ownership of the ETF or any custody or redemption rights.",
    "category": "exposure",
    "riskLevel": "medium",
    "collateralType": "ETH",
    "currentPrice": 0,
    "priceChange24h": 0,
    "tvl": 0,
    "fees": {
      "mint": 0.004,
      "burn": 0.004,
      "management": 0.007
    },
    "oracleSources": [
      {
        "name": "Massive Minute Aggregates (CPER)",
        "type": "off-chain",
        "endpoint": "api.massive.com/v2/aggs/ticker/CPER/range/1/minute"
      },
      {
        "name": "Signed Oracle",
        "type": "off-chain",
        "endpoint": ""
      }
    ],
    "createdAt": "2026-02-13T00:00:00Z",
    "isActive": true,
    "contractAddress": "0x0f811B35Cb9729805FceC885C29a31f914304891",
    "explorerUrl": "https://horizen.calderaexplorer.xyz/address/0x0f811B35Cb9729805FceC885C29a31f914304891"
  },
  {
    "id": "fx-eurusd",
    "name": "EUR/USD Proxy",
    "ticker": "zEUR",
    "description": "FX price proxy for EUR/USD.",
    "longDescription": "zEUR is a synthetic proxy based on EUR/USD FX price data. It does not represent custody of currency or redemption rights.",
    "category": "exposure",
    "riskLevel": "low",
    "collateralType": "ETH",
    "currentPrice": 0,
    "priceChange24h": 0,
    "tvl": 0,
    "fees": {
      "mint": 0.002,
      "burn": 0.002,
      "management": 0.004
    },
    "oracleSources": [
      {
        "name": "Massive Minute Aggregates (C:EURUSD)",
        "type": "off-chain",
        "endpoint": "api.massive.com/v2/aggs/ticker/C:EURUSD/range/1/minute"
      },
      {
        "name": "Signed Oracle",
        "type": "off-chain",
        "endpoint": ""
      }
    ],
    "createdAt": "2026-02-13T00:00:00Z",
    "isActive": true,
    "contractAddress": "0x2b92326Bd9eF39b74b537072b40176F2cC69AcA9",
    "explorerUrl": "https://horizen.calderaexplorer.xyz/address/0x2b92326Bd9eF39b74b537072b40176F2cC69AcA9"
  },
  {
    "id": "fx-gbpusd",
    "name": "GBP/USD Proxy",
    "ticker": "zGBP",
    "description": "FX price proxy for GBP/USD.",
    "longDescription": "zGBP is a synthetic proxy based on GBP/USD FX price data. It does not represent custody of currency or redemption rights.",
    "category": "exposure",
    "riskLevel": "low",
    "collateralType": "ETH",
    "currentPrice": 0,
    "priceChange24h": 0,
    "tvl": 0,
    "fees": {
      "mint": 0.002,
      "burn": 0.002,
      "management": 0.004
    },
    "oracleSources": [
      {
        "name": "Massive Minute Aggregates (C:GBPUSD)",
        "type": "off-chain",
        "endpoint": "api.massive.com/v2/aggs/ticker/C:GBPUSD/range/1/minute"
      },
      {
        "name": "Signed Oracle",
        "type": "off-chain",
        "endpoint": ""
      }
    ],
    "createdAt": "2026-02-13T00:00:00Z",
    "isActive": true,
    "contractAddress": "0xFBb1df06bb4c48ae5A66039C38aE95cf1409DF41",
    "explorerUrl": "https://horizen.calderaexplorer.xyz/address/0xFBb1df06bb4c48ae5A66039C38aE95cf1409DF41"
  },
  {
    "id": "fx-usdjpy",
    "name": "USD/JPY Proxy",
    "ticker": "zJPY",
    "description": "FX price proxy for USD/JPY.",
    "longDescription": "zJPY is a synthetic proxy based on USD/JPY FX price data. It does not represent custody of currency or redemption rights.",
    "category": "exposure",
    "riskLevel": "low",
    "collateralType": "ETH",
    "currentPrice": 0,
    "priceChange24h": 0,
    "tvl": 0,
    "fees": {
      "mint": 0.002,
      "burn": 0.002,
      "management": 0.004
    },
    "oracleSources": [
      {
        "name": "Massive Minute Aggregates (C:USDJPY)",
        "type": "off-chain",
        "endpoint": "api.massive.com/v2/aggs/ticker/C:USDJPY/range/1/minute"
      },
      {
        "name": "Signed Oracle",
        "type": "off-chain",
        "endpoint": ""
      }
    ],
    "createdAt": "2026-02-13T00:00:00Z",
    "isActive": true,
    "contractAddress": "0xdA8d85bd6942A1Ae478CBc2E76aAfCc9Dd14B69F",
    "explorerUrl": "https://horizen.calderaexplorer.xyz/address/0xdA8d85bd6942A1Ae478CBc2E76aAfCc9Dd14B69F"
  }
] as const;
