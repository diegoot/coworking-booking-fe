import { toSafeRedirect } from "@/lib/utils/safe-redirect";
import { LoginForm } from "./login-form";

type LoginPageProps = {
  searchParams: Promise<{ registered?: string; redirect?: string }>;
};

/**
 * Server Component shell (SSG-able, no data dependency of its own).
 * Reads and sanitizes `?redirect=` here (see `toSafeRedirect`) before
 * passing it down as a plain prop, so `LoginForm` doesn't need
 * `useSearchParams()`/a Suspense boundary and can't be handed an
 * unvalidated redirect target.
 */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { registered, redirect } = await searchParams;
  const redirectTo = toSafeRedirect(redirect);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Log in
      </h1>
      {registered && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          Account created. Log in with your new credentials.
        </p>
      )}
      <LoginForm redirectTo={redirectTo} />
    </div>
  );
}
