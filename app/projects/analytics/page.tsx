import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AnnouncerProvider } from "@/lib/announcer";
import { parseFilters } from "@/lib/analytics/queries";
import { FiltersBar } from "./Filters";
import { KpiCards } from "./KpiCards";
import { ExportCsvButton } from "./ExportCsvButton";
import { ChartSkeleton } from "./charts/ChartSkeleton";
import {
  LineChartSection,
  BarChartSection,
  PieChartSection,
} from "./charts/sections";

export const metadata = {
  title: "Analytics dashboard",
};

// Reading searchParams opts the page into dynamic rendering. Each filter
// change re-renders the page server-side; chart sections re-suspend and
// stream in independently.

type Search = Promise<{ dept?: string | string[]; range?: string | string[] }>;

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const params = await searchParams;
  const filters = parseFilters(params);
  // Keying Suspense boundaries on the filter ensures the fallback re-shows
  // when filters change (otherwise React would keep the stale chart visible
  // until the new data arrives).
  const filterKey = `${filters.department}-${filters.range}`;

  return (
    <AnnouncerProvider debounceMs={500}>
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-medium text-orange-800 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to home
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Internal portal analytics
            </h1>
            <p className="mt-2 text-gray-700">
              Page-view trends across the four service departments. Filter
              state lives in the URL — refresh to keep your view, share the
              link to share the view. Each chart includes a plain-English
              summary, a screen-reader-only data table, a &quot;view as
              data&quot; toggle, and (on the line chart) a sonification.
            </p>
          </div>
          <ExportCsvButton filters={filters} />
        </div>

        <FiltersBar filters={filters} />

        <KpiCards filters={filters} />

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <Suspense
            key={`line-${filterKey}`}
            fallback={
              <ChartSkeleton
                title="Monthly trend"
                className="lg:col-span-2"
              />
            }
          >
            <LineChartSection filters={filters} />
          </Suspense>
          <Suspense
            key={`bar-${filterKey}`}
            fallback={<ChartSkeleton title="Department comparison" />}
          >
            <BarChartSection filters={filters} />
          </Suspense>
          <Suspense
            key={`pie-${filterKey}`}
            fallback={<ChartSkeleton title="Pages by category" />}
          >
            <PieChartSection filters={filters} />
          </Suspense>
        </div>
      </div>
    </AnnouncerProvider>
  );
}
