import { NextResponse } from "next/server";
import { MOCK_TIERS } from "@/lib/mock-data";

// TODO: Replace with real tier configuration from contract/backend
export async function GET() {
  return NextResponse.json(MOCK_TIERS);
}
