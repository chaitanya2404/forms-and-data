"use client";

// Three-layer chart accessibility shell.
//
// Layer 1: a `role="img"` wrapper with a descriptive `aria-label` so screen
//          readers get a one-sentence summary of the chart instead of the
//          raw SVG.
// Layer 2: a visually-hidden <table> sibling so screen reader users get the
//          underlying numbers in tabular form.
// Layer 3: a "View as data" toggle that swaps the chart for the *visible*
//          table — useful for sighted keyboard users who'd rather scan
//          numbers than parse a chart.
//
// Per-chart extras (sonification on the line chart, keyboard nav inside
// Recharts) are added in the chart card itself; the shell stays generic.

import { useState, type ReactNode } from "react";
import { Table2, BarChart3 } from "lucide-react";

export function ChartCard({
  headingId,
  title,
  summary,
  ariaLabel,
  className,
  chart,
  table,
  extras,
}: {
  headingId: string;
  title: string;
  summary: string;
  ariaLabel: string;
  className?: string;
  chart: ReactNode;
  table: ReactNode;
  // Optional chart-specific controls — e.g. sonify button on the line chart.
  extras?: ReactNode;
}) {
  const [viewAsData, setViewAsData] = useState(false);

  return (
    <section
      aria-labelledby={headingId}
      className={`rounded-lg border border-gray-200 bg-white p-5 shadow-sm ${className ?? ""}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3
            id={headingId}
            className="text-lg font-semibold text-gray-900"
          >
            {title}
          </h3>
          <p className="mt-1 text-sm text-gray-700">{summary}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {extras}
          <button
            type="button"
            onClick={() => setViewAsData((v) => !v)}
            aria-pressed={viewAsData}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-900 hover:bg-gray-50"
          >
            {viewAsData ? (
              <>
                <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
                View as chart
              </>
            ) : (
              <>
                <Table2 className="h-3.5 w-3.5" aria-hidden="true" />
                View as data
              </>
            )}
          </button>
        </div>
      </div>
      {viewAsData ? (
        <div className="mt-4 overflow-x-auto">
          {/* When toggled on, the same data appears as a visible table.
              The sr-only sibling table is suppressed in this mode to avoid
              duplicate announcement. */}
          <VisibleVersion>{table}</VisibleVersion>
        </div>
      ) : (
        <>
          <div
            role="img"
            aria-label={ariaLabel}
            className="mt-4 h-72 w-full"
          >
            {chart}
          </div>
          {table}
        </>
      )}
    </section>
  );
}

// Renders the same JSX as the sr-only table but without the sr-only class
// so it's actually visible. We do this by cloning the element.
function VisibleVersion({ children }: { children: ReactNode }) {
  // The expected shape is a <table className="sr-only"> — we wrap it in a
  // div that overrides the visibility. Simpler than cloning props.
  return (
    <div className="[&>table]:not-sr-only [&>table]:w-full [&>table]:border-collapse [&>table]:text-left [&>table]:text-sm [&_th]:px-3 [&_th]:py-2 [&_th]:font-semibold [&_th]:text-gray-900 [&_td]:px-3 [&_td]:py-2 [&_td]:text-gray-900 [&_thead]:border-b-2 [&_thead]:border-gray-300 [&_tbody_tr]:border-b [&_tbody_tr]:border-gray-200 [&_caption]:mb-2 [&_caption]:text-left [&_caption]:font-semibold [&_caption]:text-gray-900">
      {children}
    </div>
  );
}
