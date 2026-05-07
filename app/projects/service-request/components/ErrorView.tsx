"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, RotateCw } from "lucide-react";
import { useFocusOnMount } from "@/lib/focus";
import { useAnnouncer } from "@/lib/announcer";
import { track } from "@/lib/telemetry";
import { retrySubmit } from "../actions";

export function ErrorView({ message }: { message: string }) {
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const { announce } = useAnnouncer();

  useEffect(() => {
    track({
      type: "form_submitted",
      success: false,
      attempt: 1,
    });
    announce(message, "assertive");
  }, [announce, message]);

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
        Submission failed
      </h1>

      <div
        role="alert"
        className="mt-6 flex items-start gap-3 rounded-md border-2 border-red-700 bg-red-50 p-4"
      >
        <AlertTriangle
          className="mt-0.5 h-5 w-5 shrink-0 text-red-700"
          aria-hidden="true"
        />
        <p className="text-sm font-medium text-red-800">{message}</p>
      </div>

      <p className="mt-6 text-gray-700">
        Your details are still saved. Try again, or go back to step 3 to
        review.
      </p>

      <form action={retrySubmit} className="mt-6">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-md bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
        >
          <RotateCw className="h-4 w-4" aria-hidden="true" />
          Try again
        </button>
      </form>
    </div>
  );
}
