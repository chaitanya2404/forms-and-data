"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { DEPARTMENT_COLORS, type Department } from "../data";
import type { Filters } from "@/lib/analytics/queries";
import { ChartCard } from "./ChartCard";

type Row = { department: Department; views: number };

export function BarChartCard({
  data,
  filters,
}: {
  data: Row[];
  filters: Filters;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Memoization audit: this is a single sort + reduce over at most 4 rows.
  // It runs once per render. There is no measurable benefit to memoising it,
  // so we don't.
  const summary = (() => {
    if (data.length === 0) {
      return `No data for the selected filter over the last ${filters.range} months.`;
    }
    if (filters.department !== "all") {
      const single = data[0];
      return `${single.department} totaled ${single.views.toLocaleString("en-US")} page views over the last ${filters.range} months.`;
    }
    const sorted = [...data].sort((a, b) => b.views - a.views);
    const top = sorted[0];
    const bottom = sorted[sorted.length - 1];
    return `${top.department} led with ${top.views.toLocaleString("en-US")} page views, while ${bottom.department} had the fewest at ${bottom.views.toLocaleString("en-US")}, over the last ${filters.range} months.`;
  })();

  const ariaLabel = `Bar chart comparing total page views by department over the last ${filters.range} months.`;

  if (data.length === 0) {
    return (
      <ChartCard
        headingId="bar-chart-heading"
        title="Department comparison"
        summary={summary}
        ariaLabel={ariaLabel}
        chart={<EmptyChart />}
        table={<EmptyTable filters={filters} />}
      />
    );
  }

  return (
    <ChartCard
      headingId="bar-chart-heading"
      title="Department comparison"
      summary={summary}
      ariaLabel={ariaLabel}
      chart={
        mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} accessibilityLayer>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="department" stroke="#374151" />
              <YAxis stroke="#374151" />
              <Tooltip
                contentStyle={{
                  borderRadius: 6,
                  border: "1px solid #d1d5db",
                }}
              />
              <Bar dataKey="views" radius={[4, 4, 0, 0]}>
                {data.map((entry) => (
                  <Cell
                    key={entry.department}
                    fill={DEPARTMENT_COLORS[entry.department]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )
      }
      table={
        <table className="sr-only">
          <caption>
            Total page views by department, last {filters.range} months
          </caption>
          <thead>
            <tr>
              <th scope="col">Department</th>
              <th scope="col">Total page views</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.department}>
                <th scope="row">{row.department}</th>
                <td>{row.views.toLocaleString("en-US")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    />
  );
}

function EmptyChart() {
  return (
    <div className="flex h-full items-center justify-center rounded border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-700">
      No data for the selected filter. Try expanding the date range or
      selecting all departments.
    </div>
  );
}

function EmptyTable({ filters }: { filters: Filters }) {
  return (
    <table className="sr-only">
      <caption>
        Total page views by department, last {filters.range} months
      </caption>
      <thead>
        <tr>
          <th scope="col">Department</th>
          <th scope="col">Total page views</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td colSpan={2}>No data for the selected filter.</td>
        </tr>
      </tbody>
    </table>
  );
}
