import { NextResponse } from "next/server";
import { MOCK_REWARD_SUMMARY } from "@/lib/mock-data";

// TODO: Replace with wallet-specific rewards query from backend
// This should accept a wallet address param and return real data
export async function GET() {
  return NextResponse.json(MOCK_REWARD_SUMMARY);
}
