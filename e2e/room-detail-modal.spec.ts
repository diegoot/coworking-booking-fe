import { test, expect } from "@playwright/test";

/**
 * Covers the intercepting-route behavior for `/rooms/[id]`:
 * navigating there from Home opens a modal overlay (no full page
 * transition), while direct navigation or a refresh renders the full
 * page. This is the trickiest behavior in this feature and easy to
 * regress silently, so it's locked in with a real browser test per
 * AGENTS.md.
 */

test.describe("Room detail intercepting route", () => {
  test("opens as a modal overlay when navigated from Home", async ({
    page,
  }) => {
    await page.goto("/");

    const firstViewDetails = page
      .getByRole("link", { name: "View details" })
      .first();
    await firstViewDetails.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // The underlying Home content stays mounted behind the modal —
    // this wasn't a full page navigation.
    await expect(page.getByRole("heading", { name: "Rooms" })).toBeVisible();

    // The URL still reflects /rooms/[id] even though the modal is shown.
    await expect(page).toHaveURL(/\/rooms\/[^/]+$/);

    // Modal content shows the room's capacity, price and a Book now link.
    await expect(dialog.getByText(/people/)).toBeVisible();
    await expect(dialog.getByText(/\/hour/)).toBeVisible();
    await expect(
      dialog.getByRole("link", { name: "Book now" })
    ).toBeVisible();
  });

  test("closes the modal via the X button and returns to Home", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "View details" }).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await page.getByRole("button", { name: "Close" }).click();

    await expect(dialog).not.toBeVisible();
    await expect(page).toHaveURL("/");
  });

  test("closes the modal by clicking the backdrop", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "View details" }).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Click outside the dialog panel, on the backdrop itself.
    await page.mouse.click(5, 5);

    await expect(dialog).not.toBeVisible();
    await expect(page).toHaveURL("/");
  });

  test("closes the modal via the Escape key", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "View details" }).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await page.keyboard.press("Escape");

    await expect(dialog).not.toBeVisible();
    await expect(page).toHaveURL("/");
  });

  test("direct navigation to a room URL renders the full page, not the modal", async ({
    page,
  }) => {
    await page.goto("/");
    const href = await page
      .getByRole("link", { name: "View details" })
      .first()
      .getAttribute("href");
    if (!href) throw new Error("Expected a room link href on Home");

    await page.goto(href);

    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(
      page.getByRole("link", { name: "Book now" })
    ).toBeVisible();
  });

  test("refreshing while on a room URL still renders the full page, not the modal", async ({
    page,
  }) => {
    await page.goto("/");
    const href = await page
      .getByRole("link", { name: "View details" })
      .first()
      .getAttribute("href");
    if (!href) throw new Error("Expected a room link href on Home");

    // Open the modal, then reload while the URL is on /rooms/[id].
    await page.getByRole("link", { name: "View details" }).first().click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.reload();

    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(
      page.getByRole("link", { name: "Book now" })
    ).toBeVisible();
  });
});
