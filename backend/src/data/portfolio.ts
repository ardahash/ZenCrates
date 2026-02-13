export const PORTFOLIO = {
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
      pnlPercent: 4.87
    },
    {
      crateId: "inflation-hedge",
      crateName: "CPI Anchor Index",
      ticker: "zCPI",
      category: "exposure",
      balance: 52.1,
      value: 5858.65,
      pnl: -123.45,
      pnlPercent: -2.06
    }
  ]
} as const;
