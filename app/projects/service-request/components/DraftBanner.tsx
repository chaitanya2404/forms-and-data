"use client";

import { useEffect, useState } from "react";
import { Save, X } from "lucide-react";
import { clearDraft, loadDraft, relativeTime, type Draft } from "../draft";
import { loadDraftToServer } from "../actions";

// Banner that appears on step 1 if a draft exists. Only renders on the
// client (after mount) so it's a JS-enhanced feature; without JS the user
// just starts fresh.
export function DraftBanner() {
  const [draft, setDraft] = useState<Draft | null>(null);

  useEffect(() => {
    setDraft(loadDraft());
  }, []);

  if (!draft) return null;

  return (
    <div
      role="region"
      aria-label="Saved draft"
      className="mt-6 flex flex-col gap-3 rounded-md border-2 border-amber-400 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <Save
          className="mt-0.5 h-5 w-5 shrink-0 text-amber-700"
          aria-hidden="true"
        />
        <div>
          <p className="text-sm font-semibold text-amber-900">
            You have an unsubmitted draft from {relativeTime(draft.savedAt)}.
          </p>
          <p className="mt-1 text-sm text-amber-900">
            Resume where you left off, or discard it to start over.
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <form action={loadDraftToServer}>
          <input type="hidden" name="step" value={String(draft.step)} />
          <input
            type="hidden"
            name="requestType"
            value={draft.data.requestType}
          />
          <input type="hidden" name="subject" value={draft.data.subject} />
          <input
            type="hidden"
            name="description"
            value={draft.data.description}
          />
          <input type="hidden" name="urgency" value={draft.data.urgency} />
          <input type="hidden" name="fileName" value={draft.data.fileName} />
          <button
            type="submit"
            className="inline-flex items-center rounded-md bg-amber-700 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-800"
          >
            Resume draft
          </button>
        </form>
        <button
          type="button"
          onClick={() => {
            clearDraft();
            setDraft(null);
          }}
          className="inline-flex items-center gap-1 rounded-md border-2 border-amber-700 bg-white px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-100"
        >
          <X className="h-4 w-4" aria-hidden="true" />
          Discard
        </button>
      </div>
    </div>
  );
}
