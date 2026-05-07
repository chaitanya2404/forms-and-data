"use client";

// Accessible custom-styled file input.
//
// Why we don't `display: none` the input:
//   - `display: none` removes the element from the accessibility tree AND the
//     tab order. Keyboard users can never focus the input. Some assistive tech
//     also stops reporting it as a form control.
//   - `visibility: hidden` has the same problem.
//
// Why we use `sr-only` (the Tailwind visually-hidden utility):
//   - It hides the input visually but keeps it in the DOM, the a11y tree, and
//     the tab order. The label provides the visible UI; the real input
//     receives focus via Tab and announces as a file input to screen readers.
//
// Why we wrap the visible chrome in a `<label>` rather than a `<button>`:
//   - The label is the input's accessible name. Activating the label
//     (mouse or keyboard via the input) opens the file picker natively. No
//     synthetic clicks, no `display: none` workarounds.
//   - The visible focus ring on the label uses `has(:focus-visible)` so the
//     ring follows the (visually-hidden) input's keyboard focus.

import { Paperclip } from "lucide-react";
import clsx from "clsx";
import type { ChangeEvent } from "react";
import { describedBy, helpId } from "./FieldError";

export function FileInput({
  fileName,
  onSelect,
}: {
  fileName: string;
  onSelect: (name: string) => void;
}) {
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onSelect(file.name);
  }

  const help = "Add a screenshot or document to support your request.";

  return (
    <div>
      <p id={helpId("attachment")} className="mt-1 text-sm text-gray-600">
        {help}
      </p>
      <label
        htmlFor="attachment"
        className={clsx(
          "mt-2 inline-flex cursor-pointer items-center gap-2 rounded-md border-2 border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50",
          "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-orange-700",
        )}
      >
        <Paperclip className="h-4 w-4" aria-hidden="true" />
        <span>
          {fileName
            ? `Replace file: ${fileName}`
            : "Attachment (optional): choose file"}
        </span>
        <input
          id="attachment"
          name="attachment"
          type="file"
          onChange={handleChange}
          className="sr-only"
          aria-describedby={describedBy("attachment", { hasHelp: true })}
        />
      </label>
      {fileName && (
        <p className="mt-2 text-sm text-gray-700">Attached: {fileName}</p>
      )}
    </div>
  );
}
