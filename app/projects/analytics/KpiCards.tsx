// KPI cards. Server component — synchronous queries, no streaming, so KPIs
// are visible immediately while charts stream in.

import clsx from "clsx";
import { Eye, TrendingUp, TrendingDown, Users } from "lucide-react";
import {
  getGrowthPercent,
  getTopDepartment,
  getTotalViews,
  type Filters,
} from "@/lib/analytics/queries";

function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

function formatPercent(n: number): string {
  const r = Math.round(n);
  return `${r > 0 ? "+" : ""}${r}%`;
}

export function KpiCards({ filters }: { filters: Filters }) {
  const total = getTotalViews(filters);
  const top = getTopDepartment(filters);
  const growth = getGrowthPercent(filters);
  const growthRounded = Math.round(growth);
  const direction =
    growthRounded > 0 ? "up" : growthRounded < 0 ? "down" : "flat";
  const growthColor =
    direction === "up"
      ? "text-emerald-700"
      : direction === "down"
        ? "text-red-700"
        : "text-gray-700";
  const GrowthIcon = direction === "down" ? TrendingDown : TrendingUp;

  const growthLabel =
    direction === "flat"
      ? "Growth: flat (0 percent change)"
      : `Growth: ${direction} ${Math.abs(growthRounded)} percent over last ${filters.range} months`;

  return (
    <section aria-labelledby="kpis-heading" className="mt-8">
      <h2 id="kpis-heading" className="sr-only">
        Key metrics for the selected filters
      </h2>
      <ul className="grid gap-4 md:grid-cols-3">
        <li
          className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
          aria-label={`Total page views: ${formatNumber(total)} over last ${filters.range} months`}
        >
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
            <Eye className="h-4 w-4 text-blue-700" aria-hidden="true" />
            <h3>Total page views</h3>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            <span aria-hidden="true">{formatNumber(total)}</span>
          </p>
          <p className="mt-1 text-sm text-gray-600">
            Last {filters.range} months
          </p>
        </li>
        <li
          className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
          aria-label={`Top department: ${top.department} with ${formatNumber(top.views)} page views`}
        >
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
            <Users className="h-4 w-4 text-blue-700" aria-hidden="true" />
            <h3>Top department</h3>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            <span aria-hidden="true">{top.department}</span>
          </p>
          <p className="mt-1 text-sm text-gray-600">
            {formatNumber(top.views)} views
          </p>
        </li>
        <li
          className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
          aria-label={growthLabel}
        >
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
            <GrowthIcon
              className={clsx("h-4 w-4", growthColor)}
              aria-hidden="true"
            />
            <h3>Growth</h3>
          </div>
          <p className={clsx("mt-2 text-3xl font-bold", growthColor)}>
            <span aria-hidden="true">{formatPercent(growth)}</span>
          </p>
          <p className="mt-1 text-sm text-gray-600">
            First half vs. second half
          </p>
        </li>
      </ul>
    </section>
  );
}
