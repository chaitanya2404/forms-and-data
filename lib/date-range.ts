// `DateRange` abstraction for the analytics dashboard.
//
// The dashboard's date filter is a small closed set ("last 3/6/12 months")
// rather than free-form dates, so we keep the type surface tight: a discrete
// `DateRangeMonths` union plus the operations the dashboard actually performs.
// If the filter ever grew to free-form ranges, the type would change but
// callers would still go through this module.

export type DateRangeMonths = 3 | 6 | 12;
export const DEFAULT_RANGE: DateRangeMonths = 6;

export const DATE_RANGE_OPTIONS: {
  value: DateRangeMonths;
  label: string;
}[] = [
  { value: 3, label: "Last 3 months" },
  { value: 6, label: "Last 6 months" },
  { value: 12, label: "Last 12 months" },
];

const VALID_RANGES: ReadonlySet<number> = new Set([3, 6, 12]);

// Parses a value (typically from a URL search param) into a valid range,
// falling back to the default. Returns the default — never throws — so
// untrusted input never crashes the page.
export function parseRange(raw: unknown): DateRangeMonths {
  const n =
    typeof raw === "number"
      ? raw
      : typeof raw === "string"
        ? Number(raw)
        : NaN;
  return VALID_RANGES.has(n) ? (n as DateRangeMonths) : DEFAULT_RANGE;
}

export function rangeLabel(range: DateRangeMonths): string {
  return (
    DATE_RANGE_OPTIONS.find((o) => o.value === range)?.label ??
    `Last ${range} months`
  );
}

// Splits a range-bounded array into "first half" / "second half" for
// growth-style comparisons. For odd-length ranges (3, 5, ...) the middle
// element is excluded so the halves are the same size and the comparison is
// fair. Both halves come from the same array — no copies of the data.
export function rangeHalves<T>(rows: readonly T[]): {
  first: readonly T[];
  second: readonly T[];
} {
  const half = Math.floor(rows.length / 2);
  if (half === 0) {
    return { first: rows, second: rows };
  }
  return { first: rows.slice(0, half), second: rows.slice(-half) };
}
