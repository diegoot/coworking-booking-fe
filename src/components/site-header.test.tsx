import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteHeader } from "./site-header";
import { useSessionStore } from "@/lib/store/session";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: vi.fn(), refresh: vi.fn() })),
}));

vi.mock("@/lib/actions/logout", () => ({
  logout: vi.fn(),
}));

describe("SiteHeader", () => {
  afterEach(() => {
    useSessionStore.setState({ session: undefined });
  });

  it("renders a neutral skeleton while the session is unresolved", () => {
    useSessionStore.setState({ session: undefined });
    render(<SiteHeader />);

    expect(screen.getAllByTestId("session-skeleton").length).toBeGreaterThan(0);
    expect(screen.queryByRole("link", { name: /log in/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /my bookings/i })).not.toBeInTheDocument();
  });

  it("renders logged-out links when the session is confirmed null", () => {
    useSessionStore.setState({ session: null });
    render(<SiteHeader />);

    expect(screen.getAllByRole("link", { name: /log in/i }).length).toBeGreaterThan(0);
    expect(screen.queryByRole("link", { name: /my bookings/i })).not.toBeInTheDocument();
  });

  it("renders the logged-in UI, gating the Admin link on role", () => {
    useSessionStore.setState({
      session: { id: "1", name: "Sample User", role: "USER" },
    });
    render(<SiteHeader />);

    expect(screen.getAllByRole("link", { name: /my bookings/i }).length).toBeGreaterThan(0);
    expect(screen.queryByRole("link", { name: /^admin$/i })).not.toBeInTheDocument();
  });

  it("shows the Admin link for an ADMIN session", () => {
    useSessionStore.setState({
      session: { id: "1", name: "Sample Admin", role: "ADMIN" },
    });
    render(<SiteHeader />);

    expect(screen.getAllByRole("link", { name: /^admin$/i }).length).toBeGreaterThan(0);
  });
});
