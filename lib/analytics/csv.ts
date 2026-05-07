// CSV export — hand-rolled (no library) so we control the escaping.
//
// RFC 4180-ish behaviour:
//   - Fields with commas, quotes, or newlines are wrapped in quotes.
//   - Embedded quotes are doubled.
//   - All cells are coerced to string via String(value).
//
// We also support an optional "preamble" — comment-style lines that appear
// before the data, used here to record the active filters at export time
// so the file is self-describing.

export type CsvRow = readonly (string | number)[];

const NEEDS_QUOTING = /[",\n\r]/;

export function escapeCell(value: string | number): string {
  const s = String(value);
  if (!NEEDS_QUOTING.test(s)) return s;
  return `"${s.replaceAll('"', '""')}"`;
}

export function rowsToCsv(rows: readonly CsvRow[]): string {
  return rows.map((row) => row.map(escapeCell).join(",")).join("\r\n");
}

export function buildCsv({
  preamble,
  header,
  rows,
}: {
  preamble?: readonly string[];
  header: CsvRow;
  rows: readonly CsvRow[];
}): string {
  const lines: string[] = [];
  if (preamble) {
    for (const line of preamble) {
      // # is widely understood as a comment marker; this isn't strict CSV
      // but consumers who care about it can strip leading '#' lines.
      lines.push(`# ${line}`);
    }
  }
  lines.push(header.map(escapeCell).join(","));
  for (const row of rows) {
    lines.push(row.map(escapeCell).join(","));
  }
  return lines.join("\r\n");
}

export function downloadCsv(filename: string, csv: string): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  // Free the object URL on the next tick so the download has time to begin.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
