"use server";

import { cookies } from "next/headers";
import { SESSION_TOKEN_COOKIE, SESSION_USER_COOKIE } from "@/lib/constants/cookies";

/**
 * Server Action (not a Route Handler): logout is a plain cookie clear,
 * not the "set a JWT as an httpOnly cookie from a raw Response" case
 * AGENTS.md reserves the login Route Handler for. Clears both the
 * httpOnly JWT cookie and the readable session cookie; the client store
 * is cleared separately by the caller (see `site-header.tsx`).
 */
export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_TOKEN_COOKIE);
  cookieStore.delete(SESSION_USER_COOKIE);
}
