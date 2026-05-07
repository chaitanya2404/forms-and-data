"use client";

// Dashboard filters — Radix Select + RadioGroup, syncing to ?dept= and
// ?range= search params. URL is the source of truth: refresh keeps state,
// share-the-link shares the view. Changes are announced through the shared
// announcer (configured at the page level with a 500ms debounce so rapid
// changes coalesce into one screen-reader message).

import { useCallback, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import * as Select from "@radix-ui/react-select";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import clsx from "clsx";
import { useAnnouncer } from "@/lib/announcer";
import { track } from "@/lib/telemetry";
import { DEPARTMENTS, type Department } from "./data";
import { DATE_RANGE_OPTIONS, type DateRangeMonths } from "@/lib/date-range";
import type { DepartmentFilter, Filters } from "@/lib/analytics/queries";

const DEPT_OPTIONS: { value: DepartmentFilter; label: string }[] = [
  { value: "all", label: "All departments" },
  ...DEPARTMENTS.map((d) => ({ value: d as DepartmentFilter, label: d })),
];

export function FiltersBar({ filters }: { filters: Filters }) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const { announce } = useAnnouncer();
  const [pending, startTransition] = useTransition();

  const update = useCallback(
    (next: Partial<Filters>) => {
      const params = new URLSearchParams(search.toString());
      const department = next.department ?? filters.department;
      const range = next.range ?? filters.range;
      if (department === "all") {
        params.delete("dept");
      } else {
        params.set("dept", department);
      }
      params.set("range", String(range));
      const url = `${pathname}?${params.toString()}`;
      startTransition(() => {
        router.replace(url, { scroll: false });
      });
      const deptText =
        department === "all" ? "all departments" : department;
      announce(`Showing data for ${deptText}, last ${range} months.`);
      if (next.department !== undefined) {
        track({
          type: "dashboard_filter_changed",
          filter: "department",
          value: department,
        });
      }
      if (next.range !== undefined) {
        track({
          type: "dashboard_filter_changed",
          filter: "range",
          value: String(range),
        });
      }
    },
    [filters, pathname, router, search, announce],
  );

  return (
    <section
      aria-labelledby="filters-heading"
      className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-5"
    >
      <div className="flex items-center justify-between gap-2">
        <h2
          id="filters-heading"
          className="text-base font-semibold text-gray-900"
        >
          Filters
        </h2>
        {pending ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-700">
            <Loader2
              className="h-3 w-3 animate-spin"
              aria-hidden="true"
            />
            Updating…
          </span>
        ) : null}
      </div>
      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="department-select"
            className="block text-sm font-semibold text-gray-900"
          >
            Department
          </label>
          <Select.Root
            value={filters.department}
            onValueChange={(v) =>
              update({ department: v as DepartmentFilter })
            }
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
              value={String(filters.range)}
              onValueChange={(v) =>
                update({ range: Number(v) as DateRangeMonths })
              }
              className="mt-2 flex flex-wrap gap-2"
              aria-label="Date range"
            >
              {DATE_RANGE_OPTIONS.map((o) => {
                const inputId = `range-${o.value}`;
                const isSelected = filters.range === o.value;
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

export type { Department };
