import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SessionHydrator } from "@/components/session-hydrator";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Coworking Booking",
  description: "Book rooms in a coworking space.",
};

// Stays a synchronous Server Component with no cookie/request-time API
// access, so it doesn't force dynamic rendering on every route that
// shares it (Home and /rooms/[id] are ISR, /how-it-works is SSG — see
// AGENTS.md's rendering strategy table). Session hydration happens
// client-side instead (see `SessionHydrator`), which is the one
// deliberate exception to "no client-side fetching for initial data":
// reading the httpOnly cookie can only happen server-side, and doing it
// in this shared layout would leak dynamic rendering into unrelated
// static/ISR routes. Next's Partial Prerendering (PPR) is designed for
// exactly this case — a static shell with a dynamic "hole" for
// session-aware UI, no client round-trip needed — but it's still
// experimental and not enabled in this project; worth revisiting if it
// stabilizes.
// static/ISR routes.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SessionHydrator />
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
