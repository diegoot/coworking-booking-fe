/**
 * Suspense fallback for `BookingsLookupForm` while `getUsers()`
 * resolves. Mirrors its shape (label + full-width field + button) so
 * the layout doesn't jump when the real select streams in.
 */
export default function BookingsLookupFormLoading() {
  return (
    <div className="flex items-end gap-2" aria-hidden="true">
      <div className="flex flex-1 flex-col">
        <div className="skeleton mb-1 h-4 w-10" />
        <div className="skeleton h-10 w-full rounded-md" />
      </div>
      <div className="skeleton h-10 w-24 rounded-md" />
    </div>
  );
}
