import { Suspense } from "react";
import { BookingsLookupForm } from "./bookings-lookup-form";
import BookingsLookupFormLoading from "./bookings-lookup-form-loading";
import { BookingsLookupResults } from "./bookings-lookup-results";
import BookingsLookupResultsLoading from "./bookings-lookup-results-loading";

type AdminBookingsPageProps = {
  searchParams: Promise<{ userId?: string }>;
};

// SSR (`no-store`): admin data must be fresh per AGENTS.md's rendering
// strategy table. The heading above renders immediately; the lookup
// form (which fetches the user list to populate its picker) and the
// results are each isolated behind their own Suspense boundary so
// neither one blocks the other.
export default async function AdminBookingsSlot({
  searchParams,
}: AdminBookingsPageProps) {
  const { userId } = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold text-base-content">
        Look up bookings by user
      </h2>
      <Suspense fallback={<BookingsLookupFormLoading />}>
        <BookingsLookupForm defaultUserId={userId} />
      </Suspense>

      {userId ? (
        <Suspense fallback={<BookingsLookupResultsLoading />}>
          <BookingsLookupResults userId={userId} />
        </Suspense>
      ) : (
        <p className="text-sm text-base-content/70">
          Select a user to view their bookings.
        </p>
      )}
    </div>
  );
}
