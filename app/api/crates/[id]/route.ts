// TODO: Replace with real backend + chain reads

import { NextResponse } from "next/server";
import { MOCK_CRATES, MOCK_PRICE_DATA } from "@/lib/mock-data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const crate = MOCK_CRATES.find((c) => c.id === id);

  if (!crate) {
    return NextResponse.json({ error: "Crate not found" }, { status: 404 });
  }

  const priceData = MOCK_PRICE_DATA.find((p) => p.crateId === id);

  // TODO: Fetch from real backend / on-chain contract reads
  return NextResponse.json({ crate, priceHistory: priceData?.snapshots ?? [] });
}
