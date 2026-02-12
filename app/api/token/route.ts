import { NextResponse } from "next/server";
import { MOCK_TOKEN_META } from "@/lib/mock-data";

// TODO: Replace with real contract reads / backend call for token metadata
export async function GET() {
  return NextResponse.json(MOCK_TOKEN_META);
}
