// Pure query layer for the analytics dashboard.
//
// Components don't compute aggregates themselves; they call functions in
// here. This keeps the "what is the data" question separate from "how is it
// shown" and makes each query individually testable.
//
// The synchronous variants (`getMonthlyTrend`, `getTotalViews`, …) are pure
// over `(MONTHLY_DATA, filters)`. The async variants wrap them with a
// per-chart latency to demonstrate streaming Suspense — the dashboard
// expects fast KPIs and slower charts.

import {
  CATEGORIES,
  CATEGORY_SHARES,
  DEPARTMENTS,
  MONTHLY_DATA,
  type Category,
  type Department,
  type MonthlyRow,
} from "@/app/projects/analytics/data";
import {
  parseRange,
  type DateRangeMonths,
  rangeHalves,
} from "@/lib/date-range";

export type DepartmentFilter = "all" | Department;

export type Filters = {
  department: DepartmentFilter;
  range: DateRangeMonths;
};

const DEPARTMENT_SET: ReadonlySet<string> = new Set(DEPARTMENTS);

export function parseDepartment(raw: unknown): DepartmentFilter {
  if (typeof raw === "string" && DEPARTMENT_SET.has(raw)) {
    return raw as Department;
  }
  return "all";
}

export function parseFilters(params: {
  dept?: string | string[];
  range?: string | string[];
}): Filters {
  const dept = Array.isArray(params.dept) ? params.dept[0] : params.dept;
  const range = Array.isArray(params.range) ? params.range[0] : params.range;
  return {
    department: parseDepartment(dept),
    range: parseRange(range),
  };
}

function visibleDepts(f: DepartmentFilter): readonly Department[] {
  return f === "all" ? DEPARTMENTS : [f];
}

function sumRow(row: MonthlyRow, depts: readonly Department[]): number {
  return depts.reduce((s, d) => s + row[d], 0);
}

export function getMonthlyTrend(filters: Filters): MonthlyRow[] {
  return MONTHLY_DATA.slice(-filters.range);
}

export function getVisibleDepartments(
  filters: Filters,
): readonly Department[] {
  return visibleDepts(filters.department);
}

export function getTotalViews(filters: Filters): number {
  const rows = getMonthlyTrend(filters);
  const depts = visibleDepts(filters.department);
  return rows.reduce((sum, r) => sum + sumRow(r, depts), 0);
}

export function getDepartmentTotals(
  filters: Filters,
): { department: Department; views: number }[] {
  const rows = getMonthlyTrend(filters);
  const depts =
    filters.department === "all" ? DEPARTMENTS : [filters.department];
  return depts.map((d) => ({
    department: d,
    views: rows.reduce((s, r) => s + r[d], 0),
  }));
}

export function getTopDepartment(filters: Filters): {
  department: Department;
  views: number;
} {
  // Top dept is computed across ALL departments regardless of the filter, so
  // the KPI remains comparative when a single department is selected.
  const rows = getMonthlyTrend(filters);
  return DEPARTMENTS.map((d) => ({
    department: d,
    views: rows.reduce((s, r) => s + r[d], 0),
  })).reduce((a, b) => (a.views >= b.views ? a : b));
}

export function getGrowthPercent(filters: Filters): number {
  const rows = getMonthlyTrend(filters);
  const depts = visibleDepts(filters.department);
  const { first, second } = rangeHalves(rows);
  if (first.length === 0 || second.length === 0) return 0;
  const sumFor = (arr: readonly MonthlyRow[]) =>
    arr.reduce((sum, r) => sum + sumRow(r, depts), 0);
  const f = sumFor(first);
  const s = sumFor(second);
  if (f === 0) return 0;
  return ((s - f) / f) * 100;
}

export function getCategoryBreakdown(
  filters: Filters,
): { name: Category; value: number }[] {
  const total = getTotalViews(filters);
  return CATEGORIES.map((c) => ({
    name: c,
    value: Math.round(total * CATEGORY_SHARES[c]),
  }));
}

// ---------------------------------------------------------------------------
// Async wrappers used by the streaming Suspense boundaries on the dashboard.
// Latencies are deliberate and per-chart so each chart appears at a slightly
// different moment — closer to a real dashboard's behaviour.

const LATENCY_LINE_MS = 400;
const LATENCY_BAR_MS = 700;
const LATENCY_PIE_MS = 550;

const delay = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));

export async function getLineChartData(
  filters: Filters,
): Promise<MonthlyRow[]> {
  await delay(LATENCY_LINE_MS);
  return getMonthlyTrend(filters);
}

export async function getBarChartData(
  filters: Filters,
): Promise<{ department: Department; views: number }[]> {
  await delay(LATENCY_BAR_MS);
  return getDepartmentTotals(filters);
}

export async function getPieChartData(
  filters: Filters,
): Promise<{ name: Category; value: number }[]> {
  await delay(LATENCY_PIE_MS);
  return getCategoryBreakdown(filters);
}
