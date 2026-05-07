"use client";

import { Download } from "lucide-react";
import { useAnnouncer } from "@/lib/announcer";
import { track } from "@/lib/telemetry";
import {
  buildCsv,
  downloadCsv,
  type CsvRow,
} from "@/lib/analytics/csv";
import {
  getDepartmentTotals,
  getMonthlyTrend,
  getVisibleDepartments,
  type Filters,
} from "@/lib/analytics/queries";

export function ExportCsvButton({ filters }: { filters: Filters }) {
  const { announce } = useAnnouncer();

  function handleClick() {
    const rows = getMonthlyTrend(filters);
    const visible = getVisibleDepartments(filters);
    const totals = getDepartmentTotals(filters);
    const header: CsvRow = ["Month", ...visible, "Total"];
    const dataRows: CsvRow[] = rows.map((r) => {
      const cells: (string | number)[] = [r.month];
      let rowTotal = 0;
      for (const d of visible) {
        cells.push(r[d]);
        rowTotal += r[d];
      }
      cells.push(rowTotal);
      return cells;
    });
    const totalsRow: CsvRow = [
      "Totals",
      ...visible.map((d) =>
        totals.find((t) => t.department === d)?.views ?? 0,
      ),
      totals.reduce((s, t) => s + t.views, 0),
    ];

    const csv = buildCsv({
      preamble: [
        `Generated on ${new Date().toISOString()}`,
        `Filter: department=${filters.department}, range=last ${filters.range} months`,
      ],
      header,
      rows: [...dataRows, totalsRow],
    });

    const ts = new Date()
      .toISOString()
      .replaceAll(":", "-")
      .replaceAll(".", "-")
      .slice(0, 19);
    downloadCsv(`analytics-${filters.department}-${filters.range}m-${ts}.csv`, csv);
    announce(`Downloaded CSV for ${filters.department} over ${filters.range} months.`);
    track({
      type: "dashboard_export_csv",
      rows: dataRows.length,
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-2 rounded-md border-2 border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
    >
      <Download className="h-4 w-4" aria-hidden="true" />
      Export CSV
      <span className="sr-only">
        {" "}
        — downloads the currently filtered view as a CSV file
      </span>
    </button>
  );
}
