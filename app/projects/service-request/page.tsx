import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AnnouncerProvider } from "@/lib/announcer";
import { readServerState } from "./state-cookie";
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

  return (
    <AnnouncerProvider>
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-medium text-orange-800 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to home
        </Link>

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
