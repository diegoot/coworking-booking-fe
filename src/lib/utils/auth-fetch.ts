import { cookies } from "next/headers";
import { SESSION_TOKEN_COOKIE } from "@/lib/constants/cookies";

/**
 * Server-only: reads the httpOnly `session_token` cookie (the raw JWT,
 * set by the login Route Handler). Never expose this value to client
 * JS — only import this module from Server Components, Server Actions,
 * or Route Handlers.
 */
export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_TOKEN_COOKIE)?.value ?? null;
}

/**
 * Wraps `fetch`, attaching `Authorization: Bearer <token>` when a
 * session token is present. Single-purpose: unlike `getApiUrl()`
 * (`lib/utils/get-api-url.ts`), which only resolves the base URL, this
 * only handles the auth header, so callers compose the two explicitly.
 *
 * A missing token here is an unexpected/defensive case rather than the
 * expected unauthenticated path: `proxy.ts` already blocks
 * unauthenticated requests to `(dashboard)` routes before any of these
 * calls happen. So instead of throwing, this still calls `fetch`
 * without the header — the backend will reject with 401, and callers
 * (e.g. `getRoomAvailability`, `createBookingAction`) already map HTTP
 * statuses to their own error handling.
 */
export async function authFetch(
  url: string,
  init?: RequestInit
): Promise<Response> {
  const token = await getSessionToken();

  const headers = new Headers(init?.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(url, { ...init, headers });
}
