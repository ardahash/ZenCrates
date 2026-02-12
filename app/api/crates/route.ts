// TODO: Replace with real backend + chain reads
// This mock API returns deterministic crate data

import { NextResponse } from "next/server";
import { MOCK_CRATES } from "@/lib/mock-data";

export async function GET() {
  // TODO: Fetch from real backend / on-chain registry
  return NextResponse.json({ crates: MOCK_CRATES });
}
