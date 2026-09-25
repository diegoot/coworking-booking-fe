const steps = [
  {
    title: "Browse rooms",
    description:
      "Check out available coworking rooms, their capacity and hourly price.",
  },
  {
    title: "Book a slot",
    description:
      "Pick a room, check its availability, and reserve the time that works for you.",
  },
  {
    title: "Manage your bookings",
    description:
      "View or cancel your upcoming bookings anytime from your dashboard.",
  },
];

// SSG: no data dependency, pure static content (see AGENTS.md rendering
// strategy table).
export default function HowItWorksPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-base-content">
          Three steps. Zero hassle.
        </h1>
        <p className="text-base-content/70">
          From picking a room to managing your bookings — here's the whole
          flow.
        </p>
      </div>

      <ul className="steps steps-vertical">
        {steps.map((step) => (
          <li
            key={step.title}
            className="step step-primary min-h-[6.25rem]"
          >
            <div className="flex flex-col items-start gap-1 text-left">
              <span className="font-medium text-base-content">
                {step.title}
              </span>
              <span className="text-sm text-base-content/70">
                {step.description}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
