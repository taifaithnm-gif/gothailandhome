import { NextResponse } from "next/server";

import { getBuildInfo } from "@/lib/build-info";

export const dynamic = "force-dynamic";

/**
 * Lightweight immutable build identity for release verification.
 * GET /api/build-info
 */
export async function GET() {
  return NextResponse.json(getBuildInfo(), {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
