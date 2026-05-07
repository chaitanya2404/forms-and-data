// Async server components that fetch chart data and hand it to the client
// chart cards. Each section is wrapped in <Suspense> at the page level so
// they stream in independently.
//
// We catch errors here per-chart so a failure in one query never blanks the
// whole dashboard. In a real app these would surface from the data layer
// (timeouts, 500s, schema mismatches); here the queries are deterministic so
// the catch arm is mostly defensive code, but it documents the pattern.

import {
  getBarChartData,
  getLineChartData,
  getPieChartData,
  type Filters,
} from "@/lib/analytics/queries";
import { LineChartCard } from "./LineChartCard";
import { BarChartCard } from "./BarChartCard";
import { PieChartCard } from "./PieChartCard";
import { ChartError } from "./ChartError";

export async function LineChartSection({ filters }: { filters: Filters }) {
  try {
    const data = await getLineChartData(filters);
    return <LineChartCard data={data} filters={filters} />;
  } catch {
    return (
      <ChartError title="Monthly trend" className="lg:col-span-2" />
    );
  }
}

export async function BarChartSection({ filters }: { filters: Filters }) {
  try {
    const data = await getBarChartData(filters);
    return <BarChartCard data={data} filters={filters} />;
  } catch {
    return <ChartError title="Department comparison" />;
  }
}

export async function PieChartSection({ filters }: { filters: Filters }) {
  try {
    const data = await getPieChartData(filters);
    return <PieChartCard data={data} filters={filters} />;
  } catch {
    return <ChartError title="Pages by category" />;
  }
}
