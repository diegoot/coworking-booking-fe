import Link from "next/link";

/**
 * Root-level `not-found.tsx`.
 *
 * Required for `notFound()` calls deep in the tree (e.g.
 * `(public)/rooms/[id]/page.tsx`) to actually produce an HTTP 404 status.
 * Without this file, Next.js has no top-level not-found boundary to render
 * as the response, which — combined with this project's `(public)/@modal`
 * parallel slot always resolving successfully via its `default.tsx` — was
 * causing the overall response for a non-existent room to be a 200 instead
 * of a 404, even though `getRoomById` correctly returned `null` and the
 * page called `notFound()`.
 */
export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-4 px-6 py-12 text-center">
      <h1 className="text-xl font-semibold text-base-content">Not found</h1>
      <p className="text-base-content/70">
        The page or resource you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link href="/" className="btn btn-neutral">
        Back to Home
      </Link>
    </main>
  );
}
