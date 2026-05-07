"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import * as Select from "@radix-ui/react-select";
import * as RadioGroup from "@radix-ui/react-radio-group";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
} from "lucide-react";
import clsx from "clsx";
import {
  DEPARTMENTS,
  MONTHLY_DATA,
  CATEGORIES,
  CATEGORY_SHARES,
  DEPARTMENT_COLORS,
  CATEGORY_COLORS,
  type Department,
  type Category,
  type MonthlyRow,
} from "./data";

type DepartmentFilter = "all" | Department;
type RangeFilter = 3 | 6 | 12;

const RANGE_OPTIONS: {
  value: RangeFilter;
  label: string;
  description: string;
}[] = [
  { value: 3, label: "Last 3 months", description: "Last 3 months" },
  { value: 6, label: "Last 6 months", description: "Last 6 months" },
  { value: 12, label: "Last 12 months", description: "Last 12 months" },
];

const DEPT_OPTIONS: { value: DepartmentFilter; label: string }[] = [
  { value: "all", label: "All departments" },
  ...DEPARTMENTS.map((d) => ({ value: d, label: d })),
];

function sumRowFor(row: MonthlyRow, depts: readonly Department[]): number {
  return depts.reduce((sum, d) => sum + row[d], 0);
}

function totalViews(
  rows: MonthlyRow[],
  depts: readonly Department[],
): number {
  return rows.reduce((sum, r) => sum + sumRowFor(r, depts), 0);
}

function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

function formatPercent(n: number): string {
  const rounded = Math.round(n);
  return `${rounded > 0 ? "+" : ""}${rounded}%`;
}

export default function AnalyticsPage() {
  const [department, setDepartment] = useState<DepartmentFilter>("all");
  const [range, setRange] = useState<RangeFilter>(6);
  const [filterAnnouncement, setFilterAnnouncement] = useState("");
  // Recharts' ResponsiveContainer measures parent layout, which doesn't exist
  // during SSR — flag mount so we render charts only client-side.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  // Skip the initial render so we don't fire an announcement on page load —
  // only when the user changes a filter.
  const isInitial = useRef(true);

  const visibleDepts = useMemo<readonly Department[]>(
    () => (department === "all" ? DEPARTMENTS : [department]),
    [department],
  );

  const filteredMonths = useMemo<MonthlyRow[]>(
    () => MONTHLY_DATA.slice(-range),
    [range],
  );

  const total = useMemo(
    () => totalViews(filteredMonths, visibleDepts),
    [filteredMonths, visibleDepts],
  );

  const deptTotalsAll = useMemo(
    () =>
      DEPARTMENTS.map((d) => ({
        dept: d,
        total: filteredMonths.reduce((s, r) => s + r[d], 0),
      })),
    [filteredMonths],
  );

  const topDeptOverall = useMemo(
    () =>
      deptTotalsAll.reduce((a, b) => (a.total >= b.total ? a : b)),
    [deptTotalsAll],
  );

  const growth = useMemo(() => {
    const half = Math.floor(range / 2);
    if (half === 0) return 0;
    const first = filteredMonths.slice(0, half);
    const second = filteredMonths.slice(-half);
    const firstSum = totalViews(first, visibleDepts);
    const secondSum = totalViews(second, visibleDepts);
    if (firstSum === 0) return 0;
    return ((secondSum - firstSum) / firstSum) * 100;
  }, [filteredMonths, visibleDepts, range]);

  const barData = useMemo(
    () =>
      DEPARTMENTS.filter(
        (d) => department === "all" || d === department,
      ).map((d) => ({
        department: d,
        views: filteredMonths.reduce((s, r) => s + r[d], 0),
      })),
    [filteredMonths, department],
  );

  const pieData = useMemo(
    () =>
      CATEGORIES.map((c) => ({
        name: c,
        value: Math.round(total * CATEGORY_SHARES[c]),
      })),
    [total],
  );

  const topCategory = useMemo(
    () => pieData.reduce((a, b) => (a.value >= b.value ? a : b)),
    [pieData],
  );

  // Update aria-live announcement on filter change (skip initial render).
  useEffect(() => {
    if (isInitial.current) {
      isInitial.current = false;
      return;
    }
    const deptText =
      department === "all" ? "all departments" : department;
    setFilterAnnouncement(
      `Showing data for ${deptText}, last ${range} months. Total page views: ${formatNumber(total)}.`,
    );
  }, [department, range, total]);

  // Plain-English summaries — recompute when filters change.
  const lineSummary = useMemo(() => {
    const direction =
      growth > 1 ? "grew" : growth < -1 ? "fell" : "stayed flat at";
    const subject =
      department === "all"
        ? "Total page views across the four departments"
        : `${department} page views`;
    if (growth === 0 && Math.abs(growth) < 1) {
      return `${subject} stayed roughly flat over the last ${range} months, finishing at ${formatNumber(total)} total.`;
    }
    return `${subject} ${direction} ${formatPercent(Math.abs(growth))} over the last ${range} months, finishing at ${formatNumber(total)} total.`;
  }, [department, range, total, growth]);

  const barSummary = useMemo(() => {
    if (department !== "all") {
      const single = barData[0];
      return `${single.department} totaled ${formatNumber(single.views)} page views over the last ${range} months.`;
    }
    const sorted = [...barData].sort((a, b) => b.views - a.views);
    const top = sorted[0];
    const bottom = sorted[sorted.length - 1];
    return `${top.department} led with ${formatNumber(top.views)} page views over the last ${range} months, while ${bottom.department} had the fewest at ${formatNumber(bottom.views)}.`;
  }, [barData, range, department]);

  const pieSummary = useMemo(() => {
    const pct = total === 0 ? 0 : Math.round((topCategory.value / total) * 100);
    return `${topCategory.name} accounted for the largest share at ${pct}% of page views over the last ${range} months.`;
  }, [topCategory, total, range]);

  const lineChartLabel = `Line chart of monthly page views over the last ${range} months for ${department === "all" ? "IT, HR, Facilities, and Procurement" : department}.`;
  const barChartLabel = `Bar chart comparing total page views by department over the last ${range} months.`;
  const pieChartLabel = `Pie chart showing the share of page views by category over the last ${range} months. ${topCategory.name} is the largest segment.`;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm font-medium text-blue-800 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to home
      </Link>

      <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
        Internal portal analytics
      </h1>
      <p className="mt-2 max-w-3xl text-gray-700">
        Page-view trends across the four service departments. Filter by
        department and date range to update the charts. Each chart includes a
        plain-English summary and a screen-reader-only data table.
      </p>

      <div
        aria-live="polite"
        aria-atomic="true"
        role="status"
        className="sr-only"
      >
        {filterAnnouncement}
      </div>

      <Filters
        department={department}
        setDepartment={setDepartment}
        range={range}
        setRange={setRange}
      />

      <KpiCards
        total={total}
        topDept={topDeptOverall.dept}
        topDeptTotal={topDeptOverall.total}
        growth={growth}
        range={range}
      />

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <ChartCard
          headingId="line-chart-heading"
          title="Monthly trend"
          summary={lineSummary}
          ariaLabel={lineChartLabel}
          className="lg:col-span-2"
          chart={
            mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredMonths}>
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
          table={
            <MonthlyTable
              caption={`Monthly page views, last ${range} months`}
              rows={filteredMonths}
              depts={visibleDepts}
            />
          }
        />

        <ChartCard
          headingId="bar-chart-heading"
          title="Department comparison"
          summary={barSummary}
          ariaLabel={barChartLabel}
          chart={
            mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
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
                  {barData.map((entry) => (
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
                Total page views by department, last {range} months
              </caption>
              <thead>
                <tr>
                  <th scope="col">Department</th>
                  <th scope="col">Total page views</th>
                </tr>
              </thead>
              <tbody>
                {barData.map((row) => (
                  <tr key={row.department}>
                    <th scope="row">{row.department}</th>
                    <td>{formatNumber(row.views)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          }
        />

        <ChartCard
          headingId="pie-chart-heading"
          title="Pages by category"
          summary={pieSummary}
          ariaLabel={pieChartLabel}
          chart={
            mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={(entry: { name?: string | number }) =>
                    String(entry.name ?? "")
                  }
                >
                  {pieData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={CATEGORY_COLORS[entry.name as Category]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 6,
                    border: "1px solid #d1d5db",
                  }}
                  formatter={(value) =>
                    formatNumber(
                      typeof value === "number" ? value : Number(value ?? 0),
                    )
                  }
                />
              </PieChart>
            </ResponsiveContainer>
            )
          }
          table={
            <table className="sr-only">
              <caption>
                Page views by category, last {range} months
              </caption>
              <thead>
                <tr>
                  <th scope="col">Category</th>
                  <th scope="col">Page views</th>
                  <th scope="col">Share</th>
                </tr>
              </thead>
              <tbody>
                {pieData.map((row) => (
                  <tr key={row.name}>
                    <th scope="row">{row.name}</th>
                    <td>{formatNumber(row.value)}</td>
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
      </div>
    </div>
  );
}

function Filters({
  department,
  setDepartment,
  range,
  setRange,
}: {
  department: DepartmentFilter;
  setDepartment: (d: DepartmentFilter) => void;
  range: RangeFilter;
  setRange: (r: RangeFilter) => void;
}) {
  return (
    <section
      aria-labelledby="filters-heading"
      className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-5"
    >
      <h2
        id="filters-heading"
        className="text-base font-semibold text-gray-900"
      >
        Filters
      </h2>
      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="department-select"
            className="block text-sm font-semibold text-gray-900"
          >
            Department
          </label>
          <Select.Root
            value={department}
            onValueChange={(v) => setDepartment(v as DepartmentFilter)}
          >
            <Select.Trigger
              id="department-select"
              className="mt-2 inline-flex w-full items-center justify-between rounded-md border-2 border-gray-300 bg-white px-3 py-2 text-base text-gray-900"
            >
              <Select.Value />
              <Select.Icon>
                <ChevronDown
                  className="h-4 w-4 text-gray-700"
                  aria-hidden="true"
                />
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content
                position="popper"
                sideOffset={4}
                className="z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border border-gray-300 bg-white shadow-lg"
              >
                <Select.Viewport className="p-1">
                  {DEPT_OPTIONS.map((o) => (
                    <Select.Item
                      key={o.value}
                      value={o.value}
                      className="relative flex cursor-pointer select-none items-center gap-2 rounded px-3 py-2 text-base text-gray-900 data-[highlighted]:bg-blue-100 data-[highlighted]:text-blue-900 data-[highlighted]:outline-none"
                    >
                      <Select.ItemIndicator>
                        <Check
                          className="h-4 w-4 text-blue-700"
                          aria-hidden="true"
                        />
                      </Select.ItemIndicator>
                      <Select.ItemText>{o.label}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>

        <div>
          <fieldset>
            <legend className="text-sm font-semibold text-gray-900">
              Date range
            </legend>
            <RadioGroup.Root
              value={String(range)}
              onValueChange={(v) =>
                setRange(Number(v) as RangeFilter)
              }
              className="mt-2 flex flex-wrap gap-2"
              aria-label="Date range"
            >
              {RANGE_OPTIONS.map((o) => {
                const inputId = `range-${o.value}`;
                const isSelected = range === o.value;
                return (
                  <label
                    key={o.value}
                    htmlFor={inputId}
                    className={clsx(
                      "inline-flex cursor-pointer items-center gap-2 rounded-md border-2 px-3 py-2 text-sm font-medium",
                      isSelected
                        ? "border-blue-700 bg-blue-50 text-blue-800"
                        : "border-gray-300 bg-white text-gray-900 hover:border-blue-400",
                    )}
                  >
                    <RadioGroup.Item
                      id={inputId}
                      value={String(o.value)}
                      className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-gray-500 bg-white data-[state=checked]:border-blue-700 data-[state=checked]:bg-blue-700"
                    >
                      <RadioGroup.Indicator className="block h-1.5 w-1.5 rounded-full bg-white" />
                    </RadioGroup.Item>
                    {o.label}
                  </label>
                );
              })}
            </RadioGroup.Root>
          </fieldset>
        </div>
      </div>
    </section>
  );
}

function KpiCards({
  total,
  topDept,
  topDeptTotal,
  growth,
  range,
}: {
  total: number;
  topDept: Department;
  topDeptTotal: number;
  growth: number;
  range: RangeFilter;
}) {
  const growthRounded = Math.round(growth);
  const growthDirection =
    growthRounded > 0 ? "up" : growthRounded < 0 ? "down" : "flat";
  const growthColor =
    growthDirection === "up"
      ? "text-emerald-700"
      : growthDirection === "down"
        ? "text-red-700"
        : "text-gray-700";
  const growthLabel =
    growthDirection === "flat"
      ? "Growth: flat (0 percent change)"
      : `Growth: ${growthRounded > 0 ? "up" : "down"} ${Math.abs(growthRounded)} percent over last ${range} months`;
  const GrowthIcon =
    growthDirection === "down" ? TrendingDown : TrendingUp;

  return (
    <section
      aria-labelledby="kpis-heading"
      className="mt-8"
    >
      <h2 id="kpis-heading" className="sr-only">
        Key metrics for the selected filters
      </h2>
      <ul className="grid gap-4 md:grid-cols-3">
        <li
          className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
          aria-label={`Total page views: ${formatNumber(total)} over last ${range} months`}
        >
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
            <Eye className="h-4 w-4 text-blue-700" aria-hidden="true" />
            <h3>Total page views</h3>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            <span aria-hidden="true">{formatNumber(total)}</span>
          </p>
          <p className="mt-1 text-sm text-gray-600">
            Last {range} months
          </p>
        </li>
        <li
          className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
          aria-label={`Top department: ${topDept} with ${formatNumber(topDeptTotal)} page views`}
        >
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
            <Users className="h-4 w-4 text-blue-700" aria-hidden="true" />
            <h3>Top department</h3>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            <span aria-hidden="true">{topDept}</span>
          </p>
          <p className="mt-1 text-sm text-gray-600">
            {formatNumber(topDeptTotal)} views
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
          <p
            className={clsx("mt-2 text-3xl font-bold", growthColor)}
          >
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

function ChartCard({
  headingId,
  title,
  summary,
  ariaLabel,
  className,
  chart,
  table,
}: {
  headingId: string;
  title: string;
  summary: string;
  ariaLabel: string;
  className?: string;
  chart: React.ReactNode;
  table: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={headingId}
      className={clsx(
        "rounded-lg border border-gray-200 bg-white p-5 shadow-sm",
        className,
      )}
    >
      <h3 id={headingId} className="text-lg font-semibold text-gray-900">
        {title}
      </h3>
      <p className="mt-1 text-sm text-gray-700">{summary}</p>
      {/* role="img" with aria-label gives screen readers a concise summary in
          place of the SVG. The table is a sibling so it remains in the a11y
          tree as the data fallback. */}
      <div role="img" aria-label={ariaLabel} className="mt-4 h-72 w-full">
        {chart}
      </div>
      {table}
    </section>
  );
}

function MonthlyTable({
  caption,
  rows,
  depts,
}: {
  caption: string;
  rows: MonthlyRow[];
  depts: readonly Department[];
}) {
  return (
    <table className="sr-only">
      <caption>{caption}</caption>
      <thead>
        <tr>
          <th scope="col">Month</th>
          {depts.map((d) => (
            <th scope="col" key={d}>
              {d}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.month}>
            <th scope="row">{row.month}</th>
            {depts.map((d) => (
              <td key={d}>{formatNumber(row[d])}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
