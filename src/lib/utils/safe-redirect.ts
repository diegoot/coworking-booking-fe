/**
 * Only allows same-origin, path-only redirect targets (e.g.
 * `/bookings/new?room=1`). Rejects protocol-relative URLs (`//evil.com`,
 * which browsers treat as `https://evil.com`), absolute URLs
 * (`https://evil.com`), and anything else that doesn't start with a
 * single `/`. Used to sanitize the `?redirect=` query param on
 * `/login` before navigating to it, preventing an open redirect.
 */
export function toSafeRedirect(target: string | null | undefined): string {
  if (target && /^\/(?!\/)/.test(target)) {
    return target;
  }
  return "/";
}
