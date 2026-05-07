"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { CATEGORY_COLORS, type Category } from "../data";
import type { Filters } from "@/lib/analytics/queries";
import { ChartCard } from "./ChartCard";

type Slice = { name: Category; value: number };

export function PieChartCard({
  data,
  filters,
}: {
  data: Slice[];
  filters: Filters;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const total = data.reduce((s, x) => s + x.value, 0);
  const top = data.reduce(
    (a, b) => (a.value >= b.value ? a : b),
    data[0] ?? { name: "Forms" as Category, value: 0 },
  );
  const pct = total === 0 ? 0 : Math.round((top.value / total) * 100);

  const summary =
    total === 0
      ? `No data for the selected filter over the last ${filters.range} months.`
      : `${top.name} accounted for the largest share at ${pct}% of page views over the last ${filters.range} months.`;

  const ariaLabel =
    total === 0
      ? "Pie chart with no data."
      : `Pie chart showing the share of page views by category over the last ${filters.range} months. ${top.name} is the largest segment.`;

  if (total === 0) {
    return (
      <ChartCard
        headingId="pie-chart-heading"
        title="Pages by category"
        summary={summary}
        ariaLabel={ariaLabel}
        chart={
          <div className="flex h-full items-center justify-center rounded border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-700">
            No data for the selected filter.
          </div>
        }
        table={
          <table className="sr-only">
            <caption>
              Page views by category, last {filters.range} months
            </caption>
            <tbody>
              <tr>
                <td>No data for the selected filter.</td>
              </tr>
            </tbody>
          </table>
        }
      />
    );
  }

  return (
    <ChartCard
      headingId="pie-chart-heading"
      title="Pages by category"
      summary={summary}
      ariaLabel={ariaLabel}
      chart={
        mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={(entry: { name?: string | number }) =>
                  String(entry.name ?? "")
                }
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={CATEGORY_COLORS[entry.name]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: 6,
                  border: "1px solid #d1d5db",
                }}
                formatter={(value) =>
                  Number(value ?? 0).toLocaleString("en-US")
                }
              />
            </PieChart>
          </ResponsiveContainer>
        )
      }
      table={
        <table className="sr-only">
          <caption>
            Page views by category, last {filters.range} months
          </caption>
          <thead>
            <tr>
              <th scope="col">Category</th>
              <th scope="col">Page views</th>
              <th scope="col">Share</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.name}>
                <th scope="row">{row.name}</th>
                <td>{row.value.toLocaleString("en-US")}</td>
                <td>
                  {total === 0
                    ? "0%"
                    : `${Math.round((row.value / total) * 100)}%`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    />
  );
}
