import { afterEach, describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { SessionHydrator } from "./session-hydrator";
import { useSessionStore } from "@/lib/store/session";
import { SESSION_USER_COOKIE } from "@/lib/constants/cookies";

function setCookie(value: string) {
  document.cookie = `${SESSION_USER_COOKIE}=${encodeURIComponent(value)}`;
}

function clearCookie() {
  document.cookie = `${SESSION_USER_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

describe("SessionHydrator", () => {
  afterEach(() => {
    clearCookie();
    useSessionStore.setState({ session: undefined });
  });

  it("resolves the session synchronously from a valid cookie", () => {
    setCookie(JSON.stringify({ id: "1", name: "Sample User", role: "USER" }));

    render(<SessionHydrator />);

    expect(useSessionStore.getState().session).toEqual({
      id: "1",
      name: "Sample User",
      role: "USER",
    });
  });

  it("resolves to null when no cookie is present", () => {
    render(<SessionHydrator />);

    expect(useSessionStore.getState().session).toBeNull();
  });

  it("resolves to null when the cookie is malformed", () => {
    setCookie("not-json");

    render(<SessionHydrator />);

    expect(useSessionStore.getState().session).toBeNull();
  });

  it("resolves to null when the cookie fails schema validation", () => {
    setCookie(JSON.stringify({ id: "1" }));

    render(<SessionHydrator />);

    expect(useSessionStore.getState().session).toBeNull();
  });
});
