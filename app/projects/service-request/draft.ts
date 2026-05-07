// localStorage-backed draft persistence for the service request form.
//
// Drafts are *separate* from the server-side cookie state. The cookie is the
// source of truth for the in-progress submission flow; a draft is the user's
// "I'll come back to this" snapshot that survives a closed tab. We surface a
// recovery banner on step 1 if a draft exists and the form is otherwise empty.

import { EMPTY_FORM_DATA, type FormData, type StepId } from "./schema";

const KEY = "sr-form-draft";

export type Draft = {
  version: 1;
  savedAt: number; // ms epoch
  step: StepId;
  data: FormData;
};

export function saveDraft(step: StepId, data: FormData): void {
  if (typeof window === "undefined") return;
  // Don't bother saving an empty draft.
  if (
    !data.requestType &&
    !data.subject.trim() &&
    !data.description.trim() &&
    !data.urgency &&
    !data.fileName
  ) {
    return;
  }
  const draft: Draft = {
    version: 1,
    savedAt: Date.now(),
    step,
    data,
  };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(draft));
  } catch {
    // ignore quota / disabled storage
  }
}

export function loadDraft(): Draft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Draft;
    if (parsed.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

export function isFormEmpty(data: FormData): boolean {
  return (
    data === EMPTY_FORM_DATA ||
    (!data.requestType &&
      !data.subject.trim() &&
      !data.description.trim() &&
      !data.urgency &&
      !data.fileName)
  );
}

export function relativeTime(savedAt: number): string {
  const diffMs = Date.now() - savedAt;
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
