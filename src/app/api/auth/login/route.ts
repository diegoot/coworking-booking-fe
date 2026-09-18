import { NextResponse } from "next/server";
import { getApiUrl } from "@/lib/utils/get-api-url";
import { authResponseSchema, loginRequestSchema } from "@/lib/schemas/auth";
import { SESSION_TOKEN_COOKIE, SESSION_USER_COOKIE } from "@/lib/constants/cookies";

/**
 * Route Handler (not a Server Action) per AGENTS.md's Mutations
 * section: login isn't a mutation of this app's own data, it's a BFF
 * proxy to the external backend's JWT-issuing endpoint. A Server Action
 * could technically set the resulting httpOnly cookie too — that's not
 * the distinction — but it's the wrong shape for "proxy a REST call to
 * another service."
 *
 * The JWT itself never appears in the JSON body — only in the httpOnly
 * cookie. The body returns just the non-sensitive session fields the
 * client needs to populate the Zustand store immediately.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid credentials payload" },
      { status: 400 }
    );
  }

  const backendRes = await fetch(`${getApiUrl()}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
    cache: "no-store",
  });

  if (!backendRes.ok) {
    return NextResponse.json(
      {
        error:
          backendRes.status === 401
            ? "Invalid email or password"
            : "Login failed",
      },
      { status: backendRes.status }
    );
  }

  const authResult = authResponseSchema.safeParse(await backendRes.json());
  if (!authResult.success) {
    return NextResponse.json(
      { error: "Unexpected response from the backend" },
      { status: 502 }
    );
  }

  const { accessToken, user } = authResult.data;
  const isProduction = process.env.NODE_ENV === "production";

  const response = NextResponse.json({ user });

  response.cookies.set(SESSION_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
  });

  // Readable (non-httpOnly) mirror of the safe session fields, so the
  // server can re-hydrate the Zustand store on future full page
  // loads/refreshes without ever reading the JWT. See
  // `lib/utils/session.ts`.
  response.cookies.set(SESSION_USER_COOKIE, JSON.stringify(user), {
    httpOnly: false,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
  });

  return response;
}
