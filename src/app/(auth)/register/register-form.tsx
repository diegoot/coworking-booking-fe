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
        <label htmlFor="name" className="label font-medium">
          Name
        </label>
        <input
          id="name"
          autoComplete="name"
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? "name-error" : undefined}
          className="input w-full"
          {...register("name")}
        />
        {errors.name && (
          <p id="name-error" className="text-sm text-error">
            {errors.name.message}
          </p>
        )}
      </div>

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
          autoComplete="new-password"
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
        {isSubmitting ? "Creating account..." : "Sign up"}
      </button>

      <p className="text-sm text-base-content/70">
        Already have an account?{" "}
        <Link href="/login" className="link link-hover font-medium">
          Log in
        </Link>
      </p>
    </form>
  );
}
