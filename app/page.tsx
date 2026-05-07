import Link from "next/link";
import { ClipboardList, BarChart3, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <section aria-labelledby="hero-heading" className="mb-16">
        <h1
          id="hero-heading"
          className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl"
        >
          Accessibility-first forms and data.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-gray-700">
          Two small projects centered on the parts of web apps users
          most often struggle with — long forms and dense dashboards — built so
          they work for keyboard and screen reader users from the start.
        </p>
      </section>

      <section aria-labelledby="projects-heading">
        <h2
          id="projects-heading"
          className="mb-6 text-2xl font-semibold text-gray-900"
        >
          Projects
        </h2>
        <ul className="grid gap-6 md:grid-cols-2">
          <li className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <ClipboardList
              className="h-8 w-8 text-blue-700"
              aria-hidden="true"
            />
            <h3 className="mt-4 text-xl font-semibold text-gray-900">
              <Link
                href="/projects/service-request"
                className="text-blue-800 hover:underline"
              >
                Service request form
              </Link>
            </h3>
            <p className="mt-2 text-gray-700">
              A three-step form with inline validation, an error summary that
              moves focus, screen-reader-friendly file input, and managed focus
              between steps.
            </p>
            <p className="mt-4">
              <Link
                href="/projects/service-request"
                className="inline-flex items-center gap-1 text-sm font-semibold text-blue-800 hover:underline"
              >
                Open the service request form
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </p>
          </li>
          <li className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <BarChart3 className="h-8 w-8 text-blue-700" aria-hidden="true" />
            <h3 className="mt-4 text-xl font-semibold text-gray-900">
              <Link
                href="/projects/analytics"
                className="text-blue-800 hover:underline"
              >
                Analytics dashboard
              </Link>
            </h3>
            <p className="mt-2 text-gray-700">
              Coming next: a keyboard-navigable analytics dashboard with
              accessible Recharts visualisations, filters, and tabular data
              alternatives.
            </p>
            <p className="mt-4">
              <Link
                href="/projects/analytics"
                className="inline-flex items-center gap-1 text-sm font-semibold text-blue-800 hover:underline"
              >
                Open the analytics dashboard
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </p>
          </li>
        </ul>
      </section>
    </div>
  );
}
