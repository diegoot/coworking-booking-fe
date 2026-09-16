// SSG: no data dependency, pure static content (see AGENTS.md rendering
// strategy table).
export default function HowItWorksPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        How it works
      </h1>
      <ol className="flex flex-col gap-4 text-zinc-700 dark:text-zinc-300">
        <li>
          <span className="font-medium text-zinc-900 dark:text-zinc-50">
            1. Browse rooms.
          </span>{" "}
          Check out available coworking rooms, their capacity and hourly
          price.
        </li>
        <li>
          <span className="font-medium text-zinc-900 dark:text-zinc-50">
            2. Book a slot.
          </span>{" "}
          Pick a room, check its availability, and reserve the time that
          works for you.
        </li>
        <li>
          <span className="font-medium text-zinc-900 dark:text-zinc-50">
            3. Manage your bookings.
          </span>{" "}
          View or cancel your upcoming bookings anytime from your dashboard.
        </li>
      </ol>
    </main>
  );
}
