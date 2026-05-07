"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useFocusOnMount } from "@/lib/focus";
import { useAnnouncer } from "@/lib/announcer";
import { track } from "@/lib/telemetry";
import { resetForm } from "../actions";
import { clearDraft } from "../draft";
import {
  requestTypeLabel,
  urgencyLabel,
  type FormData,
} from "../schema";

export function ConfirmationView({
  id,
  data,
}: {
  id: string;
  data: FormData;
}) {
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const { announce } = useAnnouncer();

  useEffect(() => {
    clearDraft();
    track({
      type: "form_submitted",
      success: true,
      requestId: id,
      attempt: 1,
    });
    announce(`Request submitted successfully. Reference ID: ${id}.`);
  }, [id, announce]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm font-medium text-blue-800 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to home
      </Link>

      <h1
        ref={headingRef}
        tabIndex={-1}
        className="mt-4 text-3xl font-bold tracking-tight text-gray-900 focus-visible:outline-none"
      >
        Request submitted
      </h1>
      <p className="mt-3 text-base text-gray-700">
        Your reference ID is{" "}
        <span className="font-mono text-base font-semibold text-gray-900">
          {id}
        </span>
        . Save it for future reference. (This is a demo — no data was sent.)
      </p>

      <section
        aria-labelledby="confirmation-summary"
        className="mt-8 rounded-lg border border-gray-200 bg-white p-6"
      >
        <h2
          id="confirmation-summary"
          className="text-lg font-semibold text-gray-900"
        >
          Summary
        </h2>
        <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-600">Request type</dt>
            <dd className="text-base text-gray-900">
              {requestTypeLabel(data.requestType)}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-600">Urgency</dt>
            <dd className="text-base text-gray-900">
              {urgencyLabel(data.urgency)}
            </dd>
          </div>
          <div className="sm:col-span-3">
            <dt className="text-sm font-medium text-gray-600">Subject</dt>
            <dd className="text-base text-gray-900">{data.subject}</dd>
          </div>
          <div className="sm:col-span-3">
            <dt className="text-sm font-medium text-gray-600">Description</dt>
            <dd className="whitespace-pre-wrap text-base text-gray-900">
              {data.description}
            </dd>
          </div>
          {data.fileName && (
            <div className="sm:col-span-3">
              <dt className="text-sm font-medium text-gray-600">Attachment</dt>
              <dd className="text-base text-gray-900">{data.fileName}</dd>
            </div>
          )}
        </dl>
      </section>

      <form action={resetForm}>
        <button
          type="submit"
          className="mt-8 inline-flex items-center gap-2 rounded-md bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
        >
          Submit another request
        </button>
      </form>
    </div>
  );
}
