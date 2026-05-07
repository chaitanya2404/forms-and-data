import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
  title: "Accessible Portfolio",
  description:
    "Forms and data, with accessibility as the differentiator. A small Next.js portfolio focused on multi-step forms and dashboards.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:text-blue-800 focus:shadow-lg focus:ring-2 focus:ring-blue-700"
        >
          Skip to main content
        </a>
        <header className="border-b border-gray-200 bg-white">
          <nav
            aria-label="Primary"
            className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4"
          >
            <Link href="/" className="text-lg font-semibold text-gray-900">
              Accessible Portfolio
            </Link>
            <ul className="flex gap-6 text-sm">
              <li>
                <Link
                  href="/projects/service-request"
                  className="font-medium text-gray-700 hover:text-blue-800 hover:underline"
                >
                  Service request
                </Link>
              </li>
              <li>
                <Link
                  href="/projects/analytics"
                  className="font-medium text-gray-700 hover:text-blue-800 hover:underline"
                >
                  Analytics
                </Link>
              </li>
            </ul>
          </nav>
        </header>
        <main id="main" tabIndex={-1} className="flex-1 focus-visible:outline-none">
          {children}
        </main>
        <footer className="border-t border-gray-200 bg-gray-50">
          <div className="mx-auto max-w-5xl px-6 py-6 text-sm text-gray-700">
            Built with Next.js, Radix UI, and Tailwind. Accessibility-first.
          </div>
        </footer>
      </body>
    </html>
  );
}
