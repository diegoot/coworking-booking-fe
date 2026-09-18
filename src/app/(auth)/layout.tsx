import type { ReactNode } from "react";

/**
 * Shared shell for `/login` and `/register`: a centered, narrow column
 * consistent with the rest of the app's Tailwind styling.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-12">
      {children}
    </main>
  );
}
