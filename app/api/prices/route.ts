// TODO: Replace with real oracle endpoint reads
// This mock API returns price snapshots for all crates

import { NextResponse } from "next/server";
import { MOCK_CRATES } from "@/lib/mock-data";

export async function GET() {
  // TODO: Fetch from ORACLE_ENDPOINT
  const prices = MOCK_CRATES.map((crate) => ({
    crateId: crate.id,
    ticker: crate.ticker,
    price: crate.currentPrice,
    change24h: crate.priceChange24h,
    timestamp: Date.now(),
  }));

  return NextResponse.json({ prices });
}
