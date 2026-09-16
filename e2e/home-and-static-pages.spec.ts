import { test, expect } from "@playwright/test";

/**
 * Covers Home listing rooms from the backend and the static
 * `/how-it-works` page. Room data comes from the live backend, so
 * assertions target structure/behavior rather than fixed room names —
 * seed data may change.
 */

test("Home lists rooms from the backend with a working detail link", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Rooms" })).toBeVisible();

  const viewDetailsLinks = page.getByRole("link", { name: "View details" });
  await expect(viewDetailsLinks.first()).toBeVisible();

  const count = await viewDetailsLinks.count();
  expect(count).toBeGreaterThan(0);

  const href = await viewDetailsLinks.first().getAttribute("href");
  expect(href).toMatch(/^\/rooms\/.+$/);
});

test("how-it-works renders static informational content", async ({
  page,
}) => {
  await page.goto("/how-it-works");

  await expect(
    page.getByRole("heading", { name: "How it works" })
  ).toBeVisible();
  await expect(page.getByText(/Browse rooms/)).toBeVisible();
});

test("Book now links to the login redirect flow while logged out", async ({
  page,
}) => {
  await page.goto("/");
  const href = await page
    .getByRole("link", { name: "View details" })
    .first()
    .getAttribute("href");
  if (!href) throw new Error("Expected a room link href on Home");

  await page.goto(href);

  const bookNowHref = await page
    .getByRole("link", { name: "Book now" })
    .getAttribute("href");

  expect(bookNowHref).toBeTruthy();
  const url = new URL(bookNowHref!, "http://localhost");
  expect(url.pathname).toBe("/login");
  const redirect = url.searchParams.get("redirect");
  expect(redirect).toMatch(/^\/bookings\/new\?room=.+$/);
});
