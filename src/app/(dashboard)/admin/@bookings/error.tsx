"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function AdminBookingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="card card-border bg-base-100 shadow-sm flex flex-col items-center gap-3 p-8 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-error/10 text-error">
        <AlertTriangle className="h-6 w-6" aria-hidden="true" />
      </span>
      <h2 className="text-lg font-semibold text-base-content">
        Couldn&apos;t load this user&apos;s bookings
      </h2>
      <p className="max-w-xs text-sm text-base-content/70">
        Something went wrong on our end. Give it another try.
      </p>
      <button onClick={reset} className="btn btn-primary mt-1">
        Try again
      </button>
    </div>
  );
}
