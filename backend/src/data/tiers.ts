export const TIERS = [
  { tier: 0, label: "None", minBalance: 0, maxBalance: 999, rebatePercent: 0 },
  { tier: 1, label: "Bronze", minBalance: 1000, maxBalance: 9999, rebatePercent: 10 },
  { tier: 2, label: "Silver", minBalance: 10000, maxBalance: 49999, rebatePercent: 20 },
  { tier: 3, label: "Gold", minBalance: 50000, maxBalance: 199999, rebatePercent: 30 },
  { tier: 4, label: "Platinum", minBalance: 200000, maxBalance: null, rebatePercent: 40 }
] as const;
