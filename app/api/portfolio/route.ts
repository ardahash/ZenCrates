// TODO: Replace with real wallet reads from chain + backend
// This mock API returns a placeholder portfolio

import { NextResponse } from "next/server";
import { MOCK_PORTFOLIO } from "@/lib/mock-data";

export async function GET() {
  // TODO: Read wallet address from auth/session,
  // fetch positions from chain via contract reads
  return NextResponse.json(MOCK_PORTFOLIO);
}
