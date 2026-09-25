"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function PublicSectionError({
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
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-3 px-6 py-24 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-error/10 text-error">
        <AlertTriangle className="h-7 w-7" aria-hidden="true" />
      </span>
      <h1 className="text-xl font-semibold text-base-content">
        Something went wrong
      </h1>
      <p className="max-w-sm text-sm text-base-content/70">
        Please give it another try.
      </p>
      <button onClick={reset} className="btn btn-primary mt-2">
        Try again
      </button>
    </main>
  );
}
