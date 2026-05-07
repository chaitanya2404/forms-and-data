"use client";

import { useFormStatus } from "react-dom";
import { ArrowRight, ArrowLeft, Loader2, Send } from "lucide-react";
import { advanceStep, goBack, submitRequest } from "../actions";

// Single source of truth for the Back / Next / Submit button row that sits at
// the bottom of every step.
//
// We use `formAction` on the secondary button so all controls live in one
// `<form>`. That's the trick that keeps the form working without JS *and*
// keeps Back as a real form submission (no JS handlers required).

export function NextButton({ label = "Next" }: { label?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="inline-flex items-center gap-2 rounded-md bg-orange-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-800 disabled:cursor-not-allowed disabled:opacity-80"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : null}
      {label}
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}

export function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      formAction={submitRequest}
      className="inline-flex items-center gap-2 rounded-md bg-orange-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-800 disabled:cursor-not-allowed disabled:opacity-80"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <Send className="h-4 w-4" aria-hidden="true" />
      )}
      Submit request
    </button>
  );
}

export function BackButton() {
  return (
    <button
      type="submit"
      formAction={goBack}
      formNoValidate
      className="inline-flex items-center gap-2 rounded-md border-2 border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      Back
    </button>
  );
}

export function ButtonRow({
  showBack,
  showSubmit = false,
  nextLabel = "Next",
}: {
  showBack: boolean;
  showSubmit?: boolean;
  nextLabel?: string;
}) {
  return (
    <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 pt-6">
      {showBack ? <BackButton /> : <span />}
      {showSubmit ? <SubmitButton /> : <NextButton label={nextLabel} />}
    </div>
  );
}

// Helper for forms that don't want a default action — just renders the
// row with the action attached to the form. Re-export for clarity.
export { advanceStep };
