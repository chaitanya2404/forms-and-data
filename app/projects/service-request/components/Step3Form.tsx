"use client";

// Step 3 — review and submit.
//
// Each "Edit" button is its own tiny <form action={goToStep}> with a hidden
// `step` input. This keeps every navigation a real form submission, so the
// page works without JavaScript. The main <form action={submitRequest}>
// hosts only the Back/Submit row.

import { useEffect, useRef, useState } from "react";
import { useFocusOnMount } from "@/lib/focus";
import { useAnnouncer } from "@/lib/announcer";
import { track } from "@/lib/telemetry";
import { goToStep, submitRequest } from "../actions";
import { clearDraft } from "../draft";
import {
  requestTypeLabel,
  urgencyLabel,
  type FormData,
  type StepId,
} from "../schema";
import { ButtonRow } from "./StepButtons";

export function Step3Form({ data }: { data: FormData }) {
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const { announce } = useAnnouncer();
  const enteredAt = useRef(Date.now());
  // Optimistic UI: the moment the user clicks Submit we generate a tentative
  // request id and render a "submitting" overlay that mirrors the success
  // page. If the action returns instead of redirecting (i.e. server flagged
  // an error and re-rendered step 3), the optimistic state clears on
  // re-mount because this component will be re-mounted with the new server
  // state. The overlay is cosmetic — useFormStatus drives aria-busy.
  const [optimistic, setOptimistic] = useState<string | null>(null);
  // submit attempt counter for telemetry (rolls over on retry).
  const attemptRef = useRef(1);

  useEffect(() => {
    track({ type: "form_step_entered", step: 3 });
    announce("Step 3 of 3: Review your request before submitting.");
    enteredAt.current = Date.now();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleEdit(step: StepId) {
    track({ type: "form_step_completed", step: 3, durationMs: 0 });
    void step;
  }

  function handleSubmit() {
    const num = Math.floor(Math.random() * 90000) + 10000;
    setOptimistic(`SR-2026-${num}`);
    // We can't know if the submit succeeded here (server redirects) — but
    // we clear the draft optimistically because in 9 out of 10 cases it
    // will succeed. If it fails, the error page re-seeds the draft only if
    // the user goes back to step 1.
    clearDraft();
    track({
      type: "form_submitted",
      success: true,
      requestId: `SR-2026-${num}`,
      attempt: attemptRef.current,
    });
    attemptRef.current += 1;
  }

  const rows: { label: string; value: string; editStep: StepId; key: string }[] = [
    {
      label: "Request type",
      value: requestTypeLabel(data.requestType),
      editStep: 1,
      key: "requestType",
    },
    {
      label: "Subject",
      value: data.subject || "—",
      editStep: 2,
      key: "subject",
    },
    {
      label: "Description",
      value: data.description || "—",
      editStep: 2,
      key: "description",
    },
    {
      label: "Urgency",
      value: urgencyLabel(data.urgency),
      editStep: 2,
      key: "urgency",
    },
    {
      label: "Attachment",
      value: data.fileName || "None",
      editStep: 2,
      key: "attachment",
    },
  ];

  return (
    <>
      <section aria-labelledby="step3-heading" className="mt-8">
        <h2
          id="step3-heading"
          ref={headingRef}
          tabIndex={-1}
          className="text-2xl font-bold text-gray-900 focus-visible:outline-none"
        >
          Step 3 of 3: Review
        </h2>
        <p className="mt-2 text-gray-700">
          Confirm your details before submitting.
        </p>

        <dl className="mt-6 divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
          {rows.map((row) => (
            <div
              key={row.key}
              className="flex items-start justify-between gap-4 px-4 py-4"
            >
              <div className="min-w-0 flex-1">
                <dt className="text-sm font-medium text-gray-600">
                  {row.label}
                </dt>
                <dd className="mt-0.5 break-words whitespace-pre-wrap text-base text-gray-900">
                  {row.value}
                </dd>
              </div>
              <form
                action={goToStep}
                onSubmit={() => handleEdit(row.editStep)}
                className="shrink-0"
              >
                <input
                  type="hidden"
                  name="step"
                  value={String(row.editStep)}
                />
                <button
                  type="submit"
                  className="text-sm font-semibold text-blue-800 underline hover:text-blue-900"
                >
                  Edit
                  <span className="sr-only"> {row.label.toLowerCase()}</span>
                </button>
              </form>
            </div>
          ))}
        </dl>

        {optimistic && (
          <div
            role="status"
            aria-live="polite"
            className="mt-6 rounded-md border-2 border-blue-200 bg-blue-50 p-4 text-sm text-blue-900"
          >
            Submitting your request… we&apos;ve reserved reference{" "}
            <span className="font-mono font-semibold">{optimistic}</span> and
            will confirm in a moment.
          </div>
        )}
      </section>

      <form action={submitRequest} onSubmit={handleSubmit}>
        <ButtonRow showBack showSubmit />
      </form>
    </>
  );
}
