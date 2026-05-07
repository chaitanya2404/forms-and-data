"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Volume2, VolumeX } from "lucide-react";
import {
  DEPARTMENTS,
  DEPARTMENT_COLORS,
  type Department,
  type MonthlyRow,
} from "../data";
import type { Filters } from "@/lib/analytics/queries";
import { play as sonify } from "@/lib/analytics/sonify";
import { ChartCard } from "./ChartCard";

export function LineChartCard({
  data,
  filters,
}: {
  data: MonthlyRow[];
  filters: Filters;
}) {
  // Defer chart render to client mount to avoid Recharts SSR layout warnings.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const visibleDepts: readonly Department[] =
    filters.department === "all"
      ? DEPARTMENTS
      : [filters.department];

  // Memoization audit: the summary depends on data + filter shape; both
  // have stable reference identity per render of this component (data is a
  // fresh array from the server every page render, but in steady state the
  // computation is cheap, so this useMemo's only real win is avoiding a
  // throwaway string allocation. Kept for clarity, not perf.
  const summary = useMemo(() => {
    if (data.length < 2) return "Not enough data to summarise.";
    const sumOf = (row: MonthlyRow) =>
      visibleDepts.reduce((s, d) => s + row[d], 0);
    const first = sumOf(data[0]);
    const last = sumOf(data[data.length - 1]);
    const change = first === 0 ? 0 : ((last - first) / first) * 100;
    const dir = change > 1 ? "grew" : change < -1 ? "fell" : "held steady at";
    const subject =
      filters.department === "all"
        ? "Total page views across the four departments"
        : `${filters.department} page views`;
    if (Math.abs(change) <= 1) {
      return `${subject} ${dir} ${last.toLocaleString("en-US")} over the last ${filters.range} months.`;
    }
    return `${subject} ${dir} ${Math.abs(Math.round(change))}% over the last ${filters.range} months, finishing at ${last.toLocaleString("en-US")}.`;
  }, [data, filters.range, filters.department, visibleDepts]);

  const ariaLabel = `Line chart of monthly page views over the last ${filters.range} months for ${filters.department === "all" ? "IT, HR, Facilities, and Procurement" : filters.department}.`;

  return (
    <ChartCard
      headingId="line-chart-heading"
      title="Monthly trend"
      summary={summary}
      ariaLabel={ariaLabel}
      className="lg:col-span-2"
      chart={
        mounted && (
          <ResponsiveContainer width="100%" height="100%">
            {/* `accessibilityLayer` adds keyboard navigation through data
                points (Tab into chart, arrow keys traverse). Recharts
                announces the focused datum via an aria-live region it
                manages. */}
            <LineChart data={data} accessibilityLayer>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#374151" />
              <YAxis stroke="#374151" />
              <Tooltip
                contentStyle={{
                  borderRadius: 6,
                  border: "1px solid #d1d5db",
                }}
              />
              <Legend />
              {visibleDepts.map((d) => (
                <Line
                  key={d}
                  type="monotone"
                  dataKey={d}
                  stroke={DEPARTMENT_COLORS[d]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )
      }
      extras={<SonifyButton data={data} depts={visibleDepts} />}
      table={
        <table className="sr-only">
          <caption>
            Monthly page views, last {filters.range} months
          </caption>
          <thead>
            <tr>
              <th scope="col">Month</th>
              {visibleDepts.map((d) => (
                <th scope="col" key={d}>
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.month}>
                <th scope="row">{row.month}</th>
                {visibleDepts.map((d) => (
                  <td key={d}>{row[d].toLocaleString("en-US")}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      }
    />
  );
}

function SonifyButton({
  data,
  depts,
}: {
  data: readonly MonthlyRow[];
  depts: readonly Department[];
}) {
  const [playing, setPlaying] = useState(false);
  const stopRef = useRef<(() => void) | null>(null);

  // The sequence we sonify is the per-month total across the visible
  // departments — same shape as the dominant trend line, just one channel.
  const series = data.map((row) =>
    depts.reduce((s, d) => s + row[d], 0),
  );

  useEffect(
    () => () => {
      stopRef.current?.();
    },
    [],
  );

  function handleClick() {
    if (playing) {
      stopRef.current?.();
      stopRef.current = null;
      setPlaying(false);
      return;
    }
    setPlaying(true);
    const handle = sonify(series, {
      onEnd: () => {
        setPlaying(false);
        stopRef.current = null;
      },
    });
    stopRef.current = handle.stop;
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={playing}
      className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-900 hover:bg-gray-50"
    >
      {playing ? (
        <>
          <VolumeX className="h-3.5 w-3.5" aria-hidden="true" />
          Stop sound
        </>
      ) : (
        <>
          <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
          Play as sound
        </>
      )}
      <span className="sr-only">
        {" "}
        — plays the trend as ascending or descending tones
      </span>
    </button>
  );
}
