import { NextResponse } from "next/server";
import { MOCK_BRIDGE_STATUS } from "@/lib/mock-data";

// TODO: Replace with real bridge status polling from bridge contract / relayer
export async function GET() {
  return NextResponse.json(MOCK_BRIDGE_STATUS);
}
