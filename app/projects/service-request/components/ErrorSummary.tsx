"use client";

import { useEffect, useRef } from "react";
import { messageFor } from "@/lib/errors";
import type { ValidationError } from "../schema";

export function ErrorSummary({
  errors,
  flashKey,
  onJumpToField,
}: {
  errors: ValidationError[];
  // Increments each time the summary should re-take focus (i.e. each failed
  // submit attempt). We don't depend on errors-array identity because errors
  // change shape as the user edits — re-focusing on every keystroke would
  // steal focus.
  flashKey: number;
  onJumpToField: (field: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (flashKey > 0 && errors.length > 0) {
      ref.current?.focus();
    }
  }, [flashKey, errors.length]);

  if (errors.length === 0) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      ref={ref}
      tabIndex={-1}
      className="mt-8 rounded-md border-2 border-red-700 bg-red-50 p-4 focus-visible:outline-2 focus-visible:outline-orange-700"
    >
      <h2 className="text-base font-semibold text-red-800">
        Please fix {errors.length} error{errors.length === 1 ? "" : "s"} before
        continuing:
      </h2>
      <ul className="mt-2 list-disc space-y-1 pl-6">
        {errors.map((e) => (
          <li key={e.field}>
            <a
              href={`#${e.field}`}
              onClick={(ev) => {
                ev.preventDefault();
                onJumpToField(e.field);
              }}
              className="font-medium text-red-800 underline hover:text-red-900"
            >
              {messageFor(e.field, e.code)}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
