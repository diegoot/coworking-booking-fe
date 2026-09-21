import { Suspense } from "react";
import { BookingsLookupForm } from "./bookings-lookup-form";
import { BookingsLookupResults } from "./bookings-lookup-results";
import BookingsLookupResultsLoading from "./bookings-lookup-results-loading";

type AdminBookingsPageProps = {
  searchParams: Promise<{ userId?: string }>;
};

// SSR (`no-store`): admin data must be fresh per AGENTS.md's rendering
// strategy table. Results are isolated behind their own Suspense
// boundary so the lookup form shell renders immediately.
export default async function AdminBookingsSlot({
  searchParams,
}: AdminBookingsPageProps) {
  const { userId } = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Look up bookings by user
      </h2>
      <BookingsLookupForm defaultUserId={userId} />

      {userId ? (
        <Suspense fallback={<BookingsLookupResultsLoading />}>
          <BookingsLookupResults userId={userId} />
        </Suspense>
      ) : (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Enter a user ID to view their bookings.
        </p>
      )}
    </div>
  );
}
