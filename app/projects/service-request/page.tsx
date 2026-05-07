import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { AnnouncerProvider } from "@/lib/announcer";
import { readServerState } from "./state-cookie";
import { resetForm } from "./actions";
import { EMPTY_FORM_DATA } from "./schema";
import { Step1Form } from "./components/Step1Form";
import { Step2Form } from "./components/Step2Form";
import { Step3Form } from "./components/Step3Form";
import { ConfirmationView } from "./components/ConfirmationView";
import { ErrorView } from "./components/ErrorView";
import { StepIndicator } from "./components/StepIndicator";
import { DraftBanner } from "./components/DraftBanner";

export const dynamic = "force-dynamic";

export default async function ServiceRequestPage() {
  const state = await readServerState();

  if (state.phase === "success") {
    return (
      <AnnouncerProvider>
        <ConfirmationView id={state.requestId} data={state.data} />
      </AnnouncerProvider>
    );
  }
  if (state.phase === "error") {
    return (
      <AnnouncerProvider>
        <ErrorView message={state.message} />
      </AnnouncerProvider>
    );
  }

  // Show the Start-over escape hatch only when the user actually has
  // something to lose — past step 1, or step 1 with a non-empty selection.
  const dataIsDirty =
    state.data.requestType !== EMPTY_FORM_DATA.requestType ||
    state.data.subject !== EMPTY_FORM_DATA.subject ||
    state.data.description !== EMPTY_FORM_DATA.description ||
    state.data.urgency !== EMPTY_FORM_DATA.urgency ||
    state.data.fileName !== EMPTY_FORM_DATA.fileName;
  const showStartOver = state.step > 1 || dataIsDirty;

  return (
    <AnnouncerProvider>
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm font-medium text-orange-800 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to home
          </Link>
          {showStartOver && (
            <form action={resetForm}>
              <button
                type="submit"
                className="inline-flex items-center gap-1 text-xs text-ink2 hover:text-ink hover:underline"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Start over
              </button>
            </form>
          )}
        </div>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
          Service request
        </h1>
        <p className="mt-2 text-gray-700">
          Submit a request to IT, Facilities, HR, or Procurement. This is a
          demo — no data is sent. Form works without JavaScript:{" "}
          <Link
            href="/projects/service-request/about"
            className="text-orange-800 underline hover:text-orange-900"
          >
            see the WCAG conformance report
          </Link>
          .
        </p>

        {state.step === 1 && <DraftBanner />}

        <StepIndicator step={state.step} />

        {state.step === 1 && (
          <Step1Form
            initialData={state.data}
            serverErrors={state.errors ?? []}
          />
        )}
        {state.step === 2 && (
          <Step2Form
            initialData={state.data}
            serverErrors={state.errors ?? []}
          />
        )}
        {state.step === 3 && <Step3Form data={state.data} />}
      </div>
    </AnnouncerProvider>
  );
}
