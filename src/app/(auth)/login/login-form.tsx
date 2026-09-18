"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  loginRequestSchema,
  sessionUserSchema,
  type LoginRequest,
} from "@/lib/schemas/auth";
import { useSessionStore } from "@/lib/store/session";

/**
 * Calls the login Route Handler (`app/api/auth/login/route.ts`), not
 * the backend directly — the Route Handler is the one that sets the
 * JWT as an httpOnly cookie. On success, validates the response body
 * with `sessionUserSchema` (never trust an unvalidated JSON body — same
 * discipline as `lib/data/rooms.ts` and the register Server Action),
 * populates the Zustand session store (never the token itself), and
 * redirects to
 * `redirectTo` — a same-origin path already sanitized server-side in
 * `login/page.tsx` (see `toSafeRedirect`) to prevent an open redirect.
 */
export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const setSession = useSessionStore((state) => state.setSession);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginRequestSchema),
  });

  async function onSubmit(values: LoginRequest) {
    setServerError(null);

    // Hits the Route Handler, not a Server Action: login isn't a mutation
    // of this app's own data, it's a BFF proxy to the external backend's
    // JWT-issuing endpoint (see AGENTS.md's Mutations section). A Server
    // Action could technically set the resulting httpOnly cookie too —
    // that's not the distinction — but it's the wrong shape for "proxy a
    // REST call to another service."
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
      cache: "no-store",
    });

    if (!res.ok) {
      const body: { error?: string } | null = await res
        .json()
        .catch(() => null);
      setServerError(body?.error ?? "Login failed");
      return;
    }

    const json: unknown = await res.json();
    const parsed = sessionUserSchema.safeParse(
      (json as { user?: unknown } | null)?.user
    );
    if (!parsed.success) {
      setServerError("Unexpected response from the server");
      return;
    }

    setSession(parsed.data);
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
      noValidate
    >
      <div className="flex flex-col gap-1">
        <label
          htmlFor="email"
          className="text-sm font-medium text-zinc-900 dark:text-zinc-50"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "email-error" : undefined}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          {...register("email")}
        />
        {errors.email && (
          <p id="email-error" className="text-sm text-red-600">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="password"
          className="text-sm font-medium text-zinc-900 dark:text-zinc-50"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={errors.password ? true : undefined}
          aria-describedby={errors.password ? "password-error" : undefined}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          {...register("password")}
        />
        {errors.password && (
          <p id="password-error" className="text-sm text-red-600">
            {errors.password.message}
          </p>
        )}
      </div>

      {serverError && (
        <p role="alert" className="text-sm text-red-600">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {isSubmitting ? "Logging in..." : "Log in"}
      </button>

      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-zinc-900 underline dark:text-zinc-50"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}
