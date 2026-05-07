import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "forms-and-data — Chaitanya Reddy Basani",
  description:
    "Two accessibility-focused Next.js projects — a Server Actions form and a streaming-Suspense analytics dashboard. Visually consistent with the parent portfolio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-none focus:bg-accent focus:px-3 focus:py-2 focus:text-[11px] focus:font-semibold focus:uppercase focus:tracking-[0.08em] focus:text-accent-ink focus:shadow-lg"
        >
          skip to content
        </a>

        <header className="sticky top-0 z-40 border-b border-rule bg-paper/[0.93] backdrop-blur-md">
          <nav
            aria-label="Primary"
            className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-3.5 lg:px-16"
          >
            <Link
              href="/"
              className="flex items-center gap-2.5 text-sm font-semibold text-ink"
            >
              <span
                aria-hidden="true"
                className="block h-2 w-2 rotate-45 bg-accent"
              />
              forms-and-data
            </Link>
            <ul className="hidden items-center gap-1 sm:flex">
              <li>
                <Link
                  href="/projects/service-request"
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs text-ink2 hover:text-ink"
                >
                  <span className="text-ink3">01</span>
                  Service Request
                </Link>
              </li>
              <li>
                <Link
                  href="/projects/analytics"
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs text-ink2 hover:text-ink"
                >
                  <span className="text-ink3">02</span>
                  Analytics
                </Link>
              </li>
            </ul>
            <a
              href="https://accessibility-portfolio.vercel.app"
              className="inline-flex items-center gap-1 border border-rule px-3 py-2 text-xs text-ink hover:bg-paper2"
            >
              ← back to portfolio
            </a>
          </nav>
        </header>

        <main id="main" tabIndex={-1} className="flex-1 focus-visible:outline-none">
          {children}
        </main>

        <footer className="border-t border-rule">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-xs text-ink3 sm:flex-row sm:items-center sm:justify-between lg:px-16">
            <span>© 2026 Chaitanya Reddy Basani</span>
            <span>WCAG 2.1 AA · accessible by default</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
