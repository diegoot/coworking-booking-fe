import { afterEach, describe, expect, it } from "vitest";
import { useSessionStore } from "./session";

describe("useSessionStore", () => {
  afterEach(() => {
    useSessionStore.setState({ session: undefined });
  });

  it("starts as undefined (not yet resolved)", () => {
    expect(useSessionStore.getState().session).toBeUndefined();
  });

  it("setSession sets a concrete user", () => {
    const user = { id: "1", name: "Sample User", role: "USER" as const };
    useSessionStore.getState().setSession(user);
    expect(useSessionStore.getState().session).toEqual(user);
  });

  it("setSession(null) marks confirmed logged out", () => {
    useSessionStore.getState().setSession(null);
    expect(useSessionStore.getState().session).toBeNull();
  });

  it("clearSession resets to null, not undefined", () => {
    useSessionStore
      .getState()
      .setSession({ id: "1", name: "Sample User", role: "USER" });
    useSessionStore.getState().clearSession();
    expect(useSessionStore.getState().session).toBeNull();
  });
});
