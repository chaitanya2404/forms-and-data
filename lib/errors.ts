// Form error message library.
//
// Validators return an `ErrorCode` (closed set). All user-facing copy lives
// here. Per-field overrides exist where the generic copy isn't specific
// enough.
//
// Rules for writing error messages (applied below):
//   1. Be specific. "Subject is required" beats "this field is required".
//   2. Suggest a fix. Tell the user what to do, not just what's wrong.
//   3. Don't blame. "Subject must be at least 3 characters" — not
//      "you didn't enter enough characters".
//   4. Keep it short — one sentence, no exclamation marks, no all caps.

export type ErrorCode =
  | "REQUIRED"
  | "TOO_SHORT_3"
  | "TOO_SHORT_10"
  | "SUBMIT_FAILED";

const GENERIC: Record<ErrorCode, string> = {
  REQUIRED: "This field is required.",
  TOO_SHORT_3: "Enter at least 3 characters.",
  TOO_SHORT_10: "Enter at least 10 characters.",
  SUBMIT_FAILED:
    "We couldn't submit your request. Check your details and try again.",
};

const PER_FIELD: Record<string, Partial<Record<ErrorCode, string>>> = {
  requestType: {
    REQUIRED: "Choose a request type.",
  },
  subject: {
    REQUIRED: "Enter a subject for your request.",
    TOO_SHORT_3: "Subject must be at least 3 characters.",
  },
  description: {
    REQUIRED: "Describe what you need.",
    TOO_SHORT_10:
      "Description must be at least 10 characters — give enough detail for someone to act on it.",
  },
  urgency: {
    REQUIRED: "Choose an urgency level.",
  },
};

export function messageFor(field: string, code: ErrorCode): string {
  return PER_FIELD[field]?.[code] ?? GENERIC[code];
}

export function genericMessage(code: ErrorCode): string {
  return GENERIC[code];
}
