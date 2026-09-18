import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/utils/session";

/**
 * Isolated "who am I" endpoint, queried client-side once on app load by
 * `SessionHydrator`. Reading the session cookie has to happen
 * server-side, but doing it directly in the root layout (shared by
 * every route) would force dynamic rendering on the ISR/SSG routes
 * that share it. As its own Route Handler, the dynamic cookie read
 * stays isolated to this endpoint and never affects page caching.
 */
export async function GET() {
  const session = await getServerSession();
  return NextResponse.json(
    { user: session },
    { headers: { "Cache-Control": "no-store" } }
  );
}
