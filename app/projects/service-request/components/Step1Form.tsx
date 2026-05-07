"use client";

// Step 1 — request type.
//
// We use native <input type="radio"> rather than Radix RadioGroup here so the
// form still works without JavaScript — Radix renders <button role="radio">
// which doesn't participate in form submission. This is the deliberate
// trade-off for progressive enhancement.

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { useFocusOnMount } from "@/lib/focus";
import { useAnnouncer } from "@/lib/announcer";
import { messageFor } from "@/lib/errors";
import { track } from "@/lib/telemetry";
import {
  REQUEST_TYPE_OPTIONS,
  validateStep,
  type FormData,
  type ValidationError,
} from "../schema";
import { advanceStep } from "../actions";
import { saveDraft } from "../draft";
import { describedBy, errorId, helpId } from "./FieldError";
import { ErrorSummary } from "./ErrorSummary";
import { ButtonRow } from "./StepButtons";

export function Step1Form({
  initialData,
  serverErrors,
}: {
  initialData: FormData;
  serverErrors: ValidationError[];
}) {
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const { announce } = useAnnouncer();
  const [requestType, setRequestType] = useState<FormData["requestType"]>(
    initialData.requestType,
  );
  const [errors, setErrors] = useState<ValidationError[]>(serverErrors);
  const [flashKey, setFlashKey] = useState(serverErrors.length > 0 ? 1 : 0);
  const enteredAt = useRef(Date.now());

  useEffect(() => {
    track({ type: "form_step_entered", step: 1 });
    announce(`Step 1 of 3: Request type. ${REQUEST_TYPE_OPTIONS.length} options.`);
    enteredAt.current = Date.now();
    function onBeforeUnload() {
      track({
        type: "form_abandoned",
        step: 1,
        filledFields: requestType ? 1 : 0,
      });
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    saveDraft(1, { ...initialData, requestType });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestType]);

  function handleChange(value: FormData["requestType"]) {
    setRequestType(value);
    if (errors.length > 0) {
      setErrors(validateStep(1, { ...initialData, requestType: value }));
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const next = validateStep(1, { ...initialData, requestType });
    if (next.length > 0) {
      e.preventDefault();
      setErrors(next);
      setFlashKey((k) => k + 1);
      for (const err of next) {
        track({
          type: "form_field_errored",
          field: err.field,
          code: err.code,
        });
      }
      return;
    }
    track({
      type: "form_step_completed",
      step: 1,
      durationMs: Date.now() - enteredAt.current,
    });
  }

  const requestTypeError = errors.find((e) => e.field === "requestType");

  return (
    <form action={advanceStep} onSubmit={handleSubmit} noValidate>
      <ErrorSummary
        errors={errors}
        flashKey={flashKey}
        onJumpToField={() => {
          const target =
            document.querySelector<HTMLInputElement>(
              `input[name="requestType"]:checked`,
            ) ??
            document.querySelector<HTMLInputElement>(
              `input[name="requestType"]`,
            );
          target?.focus();
        }}
      />
      <section aria-labelledby="step1-heading" className="mt-8">
        <h2
          id="step1-heading"
          ref={headingRef}
          tabIndex={-1}
          className="text-2xl font-bold text-gray-900 focus-visible:outline-none"
        >
          Step 1 of 3: Request type
        </h2>
        <p id={helpId("requestType")} className="mt-2 text-gray-700">
          Choose the area your request relates to.
        </p>

        <fieldset
          className="mt-6 grid gap-3"
          aria-required="true"
          aria-invalid={Boolean(requestTypeError) || undefined}
          aria-describedby={describedBy("requestType", {
            hasHelp: true,
            hasError: Boolean(requestTypeError),
          })}
        >
          <legend className="sr-only">Request type</legend>
          {REQUEST_TYPE_OPTIONS.map((rt) => {
            const inputId = `rt-${rt.value}`;
            const isSelected = requestType === rt.value;
            return (
              <label
                key={rt.value}
                htmlFor={inputId}
                className={clsx(
                  "flex cursor-pointer items-start gap-3 rounded-md border-2 p-4 transition-colors",
                  "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blue-700",
                  isSelected
                    ? "border-blue-700 bg-blue-50"
                    : "border-gray-300 bg-white hover:border-blue-400",
                )}
              >
                <input
                  id={inputId}
                  name="requestType"
                  type="radio"
                  value={rt.value}
                  defaultChecked={initialData.requestType === rt.value}
                  onChange={() =>
                    handleChange(rt.value as FormData["requestType"])
                  }
                  className="mt-1 h-4 w-4 shrink-0 accent-blue-700"
                />
                <span>
                  <span className="block font-semibold text-gray-900">
                    {rt.label}
                  </span>
                  <span className="block text-sm text-gray-700">
                    {rt.description}
                  </span>
                </span>
              </label>
            );
          })}
        </fieldset>

        {requestTypeError && (
          <p
            id={errorId("requestType")}
            className="mt-3 text-sm font-medium text-red-700"
          >
            {messageFor("requestType", requestTypeError.code)}
          </p>
        )}
      </section>

      <ButtonRow showBack={false} />
    </form>
  );
}
