// Single source of truth for the service request form.
//
// - `FormData` is the shape of the *complete* answers across all steps.
// - `FormState` is a discriminated union over the state-machine states the
//   form can be in (which step, plus submission states).
// - `FIELDS` is field metadata. Validation, types, labels, and step-membership
//   all derive from this one table — no scattered "if step === 2" checks.

import type { ErrorCode } from "@/lib/errors";

export const REQUEST_TYPES = ["it", "facilities", "hr", "procurement"] as const;
export type RequestType = (typeof REQUEST_TYPES)[number];

export const URGENCIES = ["low", "medium", "high"] as const;
export type Urgency = (typeof URGENCIES)[number];

export type FormData = {
  requestType: RequestType | "";
  subject: string;
  description: string;
  urgency: Urgency | "";
  fileName: string;
};

export const EMPTY_FORM_DATA: FormData = {
  requestType: "",
  subject: "",
  description: "",
  urgency: "",
  fileName: "",
};

export type StepId = 1 | 2 | 3;
export const STEP_LABELS: Record<StepId, string> = {
  1: "Request type",
  2: "Details",
  3: "Review",
};

// Discriminated union over runtime states. Filling-in states (1/2/3) carry
// the partial data so far. Terminal states (success/error) carry submission
// metadata too.
export type FormState =
  | { kind: "filling"; step: StepId; data: FormData }
  | { kind: "submitting"; data: FormData }
  | { kind: "success"; data: FormData; requestId: string }
  | { kind: "error"; data: FormData; message: string };

// Per-field metadata. The `validate` function returns an error code (drawn
// from a closed set) so message copy lives entirely in lib/errors.
export type FieldId = keyof FormData;

export type FieldMeta = {
  id: FieldId;
  label: string;
  helpText?: string;
  required: boolean;
  belongsToStep: 1 | 2;
  // Returns null if value is acceptable, otherwise an error code.
  validate: (value: string) => ErrorCode | null;
};

export const FIELDS: Record<FieldId, FieldMeta> = {
  requestType: {
    id: "requestType",
    label: "Request type",
    required: true,
    belongsToStep: 1,
    validate: (v) => (v ? null : "REQUIRED"),
  },
  subject: {
    id: "subject",
    label: "Subject",
    helpText: "Short summary, e.g. “Laptop won’t boot”.",
    required: true,
    belongsToStep: 2,
    validate: (v) => {
      const trimmed = v.trim();
      if (!trimmed) return "REQUIRED";
      if (trimmed.length < 3) return "TOO_SHORT_3";
      return null;
    },
  },
  description: {
    id: "description",
    label: "Description",
    helpText:
      "Provide enough detail for someone to act on your request (10+ characters).",
    required: true,
    belongsToStep: 2,
    validate: (v) => {
      const trimmed = v.trim();
      if (!trimmed) return "REQUIRED";
      if (trimmed.length < 10) return "TOO_SHORT_10";
      return null;
    },
  },
  urgency: {
    id: "urgency",
    label: "Urgency",
    helpText: "How quickly does this need attention?",
    required: true,
    belongsToStep: 2,
    validate: (v) => (v ? null : "REQUIRED"),
  },
  fileName: {
    id: "fileName",
    label: "Attachment",
    required: false,
    belongsToStep: 2,
    validate: () => null,
  },
};

export const FIELDS_BY_STEP: Record<1 | 2, FieldId[]> = {
  1: (Object.values(FIELDS) as FieldMeta[])
    .filter((f) => f.belongsToStep === 1)
    .map((f) => f.id),
  2: (Object.values(FIELDS) as FieldMeta[])
    .filter((f) => f.belongsToStep === 2)
    .map((f) => f.id),
};

export type ValidationError = { field: FieldId; code: ErrorCode };

export function validateStep(
  step: 1 | 2,
  data: FormData,
): ValidationError[] {
  const errors: ValidationError[] = [];
  for (const fieldId of FIELDS_BY_STEP[step]) {
    const meta = FIELDS[fieldId];
    if (!meta.required && !data[fieldId]) continue;
    const code = meta.validate(data[fieldId] as string);
    if (code) errors.push({ field: fieldId, code });
  }
  return errors;
}

export const REQUEST_TYPE_OPTIONS: {
  value: RequestType;
  label: string;
  description: string;
}[] = [
  {
    value: "it",
    label: "IT",
    description: "Hardware, software, or network issues.",
  },
  {
    value: "facilities",
    label: "Facilities",
    description: "Building, office, or workspace requests.",
  },
  {
    value: "hr",
    label: "Human resources",
    description: "Benefits, payroll, or workplace concerns.",
  },
  {
    value: "procurement",
    label: "Procurement",
    description: "Purchasing, vendors, or contracts.",
  },
];

export const URGENCY_OPTIONS: { value: Urgency; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export function requestTypeLabel(v: RequestType | ""): string {
  return REQUEST_TYPE_OPTIONS.find((o) => o.value === v)?.label ?? "—";
}

export function urgencyLabel(v: Urgency | ""): string {
  return URGENCY_OPTIONS.find((o) => o.value === v)?.label ?? "—";
}
