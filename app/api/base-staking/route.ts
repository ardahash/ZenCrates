import { NextResponse } from "next/server";
import { backendBaseUrl } from "@/lib/backend";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const response = await fetch(`${backendBaseUrl()}/api/base-staking${url.search}`, {
    cache: "no-store",
  });
  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
