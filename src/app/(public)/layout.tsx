import type { ReactNode } from "react";

/**
 * Layout for the `(public)` route group. Declares the `@modal` parallel
 * slot required by the intercepting route at
 * `(public)/@modal/(.)rooms/[id]/page.tsx`.
 *
 * - Direct navigation / refresh on `/rooms/[id]` renders the real page in
 *   `children`, while `@modal` falls back to `default.tsx` (renders null).
 * - Client-side navigation from `/` (Home) intercepts `/rooms/[id]` and
 *   renders it inside `modal`, on top of the underlying page in `children`.
 */
export default function PublicLayout({
  children,
  modal,
}: {
  children: ReactNode;
  modal: ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
