/**
 * Reads a JWT's `exp` claim without verifying its signature — this is a
 * UX-level freshness check only, not an authorization decision (the
 * backend independently verifies the token's signature and expiry on
 * every authenticated request, see `proxy.ts`). Any decode failure
 * (malformed token, missing/non-numeric `exp`) is treated as expired,
 * matching how the rest of `proxy.ts` fails closed on malformed cookies.
 */
export function isJwtExpired(token: string): boolean {
  try {
    const payloadSegment = token.split(".")[1];
    if (!payloadSegment) {
      return true;
    }

    const base64 = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));

    if (typeof payload.exp !== "number") {
      return true;
    }

    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}
