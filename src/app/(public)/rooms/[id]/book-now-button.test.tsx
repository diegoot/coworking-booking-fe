import { afterEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { BookNowButton } from "./book-now-button";
import { useSessionStore } from "@/lib/store/session";

describe("BookNowButton", () => {
  afterEach(() => {
    useSessionStore.setState({ session: undefined });
  });

  it("renders a disabled placeholder while the session is unresolved", () => {
    useSessionStore.setState({ session: undefined });
    render(<BookNowButton roomId="room-1" />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("Book now")).toBeInTheDocument();
  });

  it("links to the login redirect flow when logged out", () => {
    useSessionStore.setState({ session: null });
    render(<BookNowButton roomId="room-1" />);

    const link = screen.getByRole("link", { name: /book now/i });
    expect(link).toHaveAttribute(
      "href",
      "/login?redirect=%2Fbookings%2Fnew%3Froom%3Droom-1"
    );
  });

  it("links straight to the booking form when authenticated", () => {
    useSessionStore.setState({
      session: { id: "1", name: "Sample User", role: "USER" },
    });
    render(<BookNowButton roomId="room-1" />);

    const link = screen.getByRole("link", { name: /book now/i });
    expect(link).toHaveAttribute("href", "/bookings/new?room=room-1");
  });

  it("renders nothing for an ADMIN session — admin doesn't book rooms for itself", () => {
    useSessionStore.setState({
      session: { id: "1", name: "Sample Admin", role: "ADMIN" },
    });
    const { container } = render(<BookNowButton roomId="room-1" />);

    expect(container).toBeEmptyDOMElement();
  });
});
