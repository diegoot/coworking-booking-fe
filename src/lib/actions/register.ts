"use server";

import { redirect } from "next/navigation";
import { getApiUrl } from "@/lib/utils/get-api-url";
import { registerRequestSchema, type RegisterRequest } from "@/lib/schemas/auth";

export interface RegisterActionResult {
  error: string;
}

/**
 * Server Action for `POST /auth/register`.
 *
 * Per AGENTS.md's Mutations section, the httpOnly-cookie-setting Route
 * Handler pattern is reserved for login only. So even though the
 * backend may also issue a JWT on register ("backend issues a JWT on
 * login/register" per AGENTS.md), this action intentionally does NOT
 * auto-login: it discards any token in the response and redirects to
 * `/login?registered=1` on success, so the user signs in explicitly
 * through the one flow that sets the session cookie. This keeps
 * cookie-writing logic in exactly one place.
 */
export async function registerAction(
  values: RegisterRequest
): Promise<RegisterActionResult | undefined> {
  const parsed = registerRequestSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Invalid registration data" };
  }

  const backendRes = await fetch(`${getApiUrl()}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
    cache: "no-store",
  });

  if (!backendRes.ok) {
    return {
      error:
        backendRes.status === 409
          ? "An account with that email already exists"
          : "Registration failed",
    };
  }

  redirect("/login?registered=1");
}
