"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { registerRequestSchema, type RegisterRequest } from "@/lib/schemas/auth";
import { registerAction } from "@/lib/actions/register";

/**
 * Submits straight to the `registerAction` Server Action (per AGENTS.md's
 * Mutations section: mutations go through Server Actions, not client
 * fetch calls). On success the action itself redirects to `/login`; on
 * failure it returns `{ error }` for inline display.
 */
export function RegisterForm() {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterRequest>({
    resolver: zodResolver(registerRequestSchema),
  });

  async function onSubmit(values: RegisterRequest) {
    setServerError(null);
    const result = await registerAction(values);
    if (result?.error) {
      setServerError(result.error);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
      noValidate
    >
      <div className="flex flex-col gap-1">
        <label
          htmlFor="name"
          className="text-sm font-medium text-zinc-900 dark:text-zinc-50"
        >
          Name
        </label>
        <input
          id="name"
          autoComplete="name"
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? "name-error" : undefined}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          {...register("name")}
        />
        {errors.name && (
          <p id="name-error" className="text-sm text-red-600">
            {errors.name.message}
          </p>
        )}
      </div>

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
          autoComplete="new-password"
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
        {isSubmitting ? "Creating account..." : "Sign up"}
      </button>

      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-zinc-900 underline dark:text-zinc-50"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}
