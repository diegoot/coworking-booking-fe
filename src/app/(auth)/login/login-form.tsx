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
        <label htmlFor="email" className="label font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "email-error" : undefined}
          className="input w-full"
          {...register("email")}
        />
        {errors.email && (
          <p id="email-error" className="text-sm text-error">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="label font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={errors.password ? true : undefined}
          aria-describedby={errors.password ? "password-error" : undefined}
          className="input w-full"
          {...register("password")}
        />
        {errors.password && (
          <p id="password-error" className="text-sm text-error">
            {errors.password.message}
          </p>
        )}
      </div>

      {serverError && (
        <div role="alert" className="alert alert-error text-sm">
          <span>{serverError}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn btn-primary mt-2"
      >
        {isSubmitting ? "Logging in..." : "Log in"}
      </button>

      <p className="text-sm text-base-content/70">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="link link-hover font-medium">
          Sign up
        </Link>
      </p>
    </form>
  );
}
