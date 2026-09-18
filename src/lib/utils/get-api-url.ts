/**
 * Shared helper for every backend caller (`lib/data/rooms.ts`, the
 * login Route Handler, the register Server Action, and future ones) so
 * the env var fallback logic lives in exactly one place.
 */
export function getApiUrl(): string {
  const url = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error(
      "Missing API_URL/NEXT_PUBLIC_API_URL environment variable"
    );
  }
  return url;
}
