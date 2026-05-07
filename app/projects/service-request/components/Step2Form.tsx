"use client";

// Step 2 — details (subject, description, urgency, attachment).
//
// We use a native <select> for urgency rather than Radix Select for the same
// PE reason as the radios on step 1: Radix Select renders a button trigger
// + portal that needs JS to function. A native <select> is universally
// keyboard-accessible and submits with the form.

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import { useFocusOnMount } from "@/lib/focus";
import { useAnnouncer } from "@/lib/announcer";
import { messageFor } from "@/lib/errors";
import { track } from "@/lib/telemetry";
import {
  URGENCY_OPTIONS,
  validateStep,
  type FormData,
  type ValidationError,
} from "../schema";
import { advanceStep } from "../actions";
import { saveDraft } from "../draft";
import { describedBy, errorId, FieldError, helpId } from "./FieldError";
import { ErrorSummary } from "./ErrorSummary";
import { FileInput } from "./FileInput";
import { ButtonRow } from "./StepButtons";

type Touched = Partial<Record<keyof FormData, boolean>>;

export function Step2Form({
  initialData,
  serverErrors,
}: {
  initialData: FormData;
  serverErrors: ValidationError[];
}) {
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const { announce } = useAnnouncer();
  const [data, setData] = useState<FormData>(initialData);
  const [errors, setErrors] = useState<ValidationError[]>(serverErrors);
  const [touched, setTouched] = useState<Touched>(
    serverErrors.length > 0
      ? Object.fromEntries(serverErrors.map((e) => [e.field, true]))
      : {},
  );
  const [flashKey, setFlashKey] = useState(serverErrors.length > 0 ? 1 : 0);
  const enteredAt = useRef(Date.now());

  useEffect(() => {
    track({ type: "form_step_entered", step: 2 });
    announce("Step 2 of 3: Details. Four fields.");
    enteredAt.current = Date.now();
    function onBeforeUnload() {
      const filled = [
        data.subject.trim(),
        data.description.trim(),
        data.urgency,
        data.fileName,
      ].filter(Boolean).length;
      track({ type: "form_abandoned", step: 2, filledFields: filled });
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    saveDraft(2, data);
  }, [data]);

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setData((d) => ({ ...d, [key]: value }));
    if (errors.some((e) => e.field === key)) {
      // Re-validate this field optimistically so the inline error clears as
      // the user types a valid value. Other fields' errors are left alone.
      setErrors((prev) => prev.filter((e) => e.field !== key));
    }
  }

  function handleBlur(field: keyof FormData) {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validateStep(2, data));
  }

  function visibleError(field: keyof FormData): string | undefined {
    if (!touched[field] && flashKey === 0) return undefined;
    const err = errors.find((e) => e.field === field);
    return err ? messageFor(field, err.code) : undefined;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const next = validateStep(2, data);
    if (next.length > 0) {
      e.preventDefault();
      const allTouched: Touched = {};
      for (const err of next) {
        allTouched[err.field] = true;
        track({
          type: "form_field_errored",
          field: err.field,
          code: err.code,
        });
      }
      setTouched((t) => ({ ...t, ...allTouched }));
      setErrors(next);
      setFlashKey((k) => k + 1);
      return;
    }
    track({
      type: "form_step_completed",
      step: 2,
      durationMs: Date.now() - enteredAt.current,
    });
  }

  return (
    <form
      action={advanceStep}
      onSubmit={handleSubmit}
      noValidate
      encType="multipart/form-data"
    >
      <ErrorSummary
        errors={errors}
        flashKey={flashKey}
        onJumpToField={(f) => document.getElementById(f)?.focus()}
      />
      <section aria-labelledby="step2-heading" className="mt-8">
        <h2
          id="step2-heading"
          ref={headingRef}
          tabIndex={-1}
          className="text-2xl font-bold text-gray-900 focus-visible:outline-none"
        >
          Step 2 of 3: Details
        </h2>
        <p className="mt-2 text-gray-700">Tell us what you need.</p>

        <div className="mt-6 space-y-6">
          <Field
            id="subject"
            label="Subject"
            help='Short summary, e.g. "Laptop won&apos;t boot".'
            required
            error={visibleError("subject")}
          >
            <input
              type="text"
              id="subject"
              name="subject"
              defaultValue={initialData.subject}
              onChange={(e) => update("subject", e.target.value)}
              onBlur={() => handleBlur("subject")}
              aria-required="true"
              aria-invalid={Boolean(visibleError("subject")) || undefined}
              aria-describedby={describedBy("subject", {
                hasHelp: true,
                hasError: Boolean(visibleError("subject")),
              })}
              className={clsx(
                "mt-2 block w-full rounded-md border-2 px-3 py-2 text-base text-gray-900",
                visibleError("subject") ? "border-red-700" : "border-gray-300",
              )}
            />
          </Field>

          <Field
            id="description"
            label="Description"
            help="Provide enough detail for someone to act on your request (10+ characters)."
            required
            error={visibleError("description")}
          >
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={initialData.description}
              onChange={(e) => update("description", e.target.value)}
              onBlur={() => handleBlur("description")}
              aria-required="true"
              aria-invalid={
                Boolean(visibleError("description")) || undefined
              }
              aria-describedby={describedBy("description", {
                hasHelp: true,
                hasError: Boolean(visibleError("description")),
              })}
              className={clsx(
                "mt-2 block w-full rounded-md border-2 px-3 py-2 text-base text-gray-900",
                visibleError("description")
                  ? "border-red-700"
                  : "border-gray-300",
              )}
            />
          </Field>

          <Field
            id="urgency"
            label="Urgency"
            help="How quickly does this need attention?"
            required
            error={visibleError("urgency")}
          >
            <div className="relative mt-2">
              <select
                id="urgency"
                name="urgency"
                defaultValue={initialData.urgency}
                onChange={(e) =>
                  update("urgency", e.target.value as FormData["urgency"])
                }
                onBlur={() => handleBlur("urgency")}
                aria-required="true"
                aria-invalid={Boolean(visibleError("urgency")) || undefined}
                aria-describedby={describedBy("urgency", {
                  hasHelp: true,
                  hasError: Boolean(visibleError("urgency")),
                })}
                className={clsx(
                  "block w-full appearance-none rounded-md border-2 bg-white px-3 py-2 pr-10 text-base text-gray-900",
                  visibleError("urgency")
                    ? "border-red-700"
                    : "border-gray-300",
                )}
              >
                <option value="">Select urgency</option>
                {URGENCY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-700"
                aria-hidden="true"
              />
            </div>
          </Field>

          <FileInputField
            initial={initialData.fileName}
            onChange={(name) => update("fileName", name)}
          />
        </div>
      </section>

      <ButtonRow showBack />
    </form>
  );
}

function Field({
  id,
  label,
  help,
  required,
  error,
  children,
}: {
  id: string;
  label: string;
  help: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-gray-900"
      >
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-1 text-red-700">
            *
          </span>
        ) : null}
      </label>
      <p id={helpId(id)} className="mt-1 text-sm text-gray-600">
        {help}
      </p>
      {children}
      <FieldError field={id} message={error} />
    </div>
  );
}

function FileInputField({
  initial,
  onChange,
}: {
  initial: string;
  onChange: (name: string) => void;
}) {
  const [name, setName] = useState(initial);
  const { announce } = useAnnouncer();
  return (
    <div>
      <span className="block text-sm font-semibold text-gray-900">
        Attachment (optional)
      </span>
      <FileInput
        fileName={name}
        onSelect={(n) => {
          setName(n);
          onChange(n);
          announce(`Attached file: ${n}`);
        }}
      />
    </div>
  );
}
