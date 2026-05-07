"use client";

import {
  useState,
  useRef,
  useEffect,
  type ChangeEvent,
  type FormEvent,
  type RefObject,
} from "react";
import Link from "next/link";
import * as RadioGroup from "@radix-ui/react-radio-group";
import * as Select from "@radix-ui/react-select";
import * as Progress from "@radix-ui/react-progress";
import {
  Check,
  ChevronDown,
  Paperclip,
  ArrowLeft,
  ArrowRight,
  Loader2,
} from "lucide-react";
import clsx from "clsx";
import { useFocusOnMount } from "@/lib/focus";

type Step = 1 | 2 | 3;
type RequestType = "" | "it" | "facilities" | "hr" | "procurement";
type Urgency = "" | "low" | "medium" | "high";

type FormState = {
  requestType: RequestType;
  subject: string;
  description: string;
  urgency: Urgency;
  fileName: string;
};

type ValidationError = { field: string; message: string };

type Confirmed = { id: string; data: FormState };

const REQUEST_TYPES: {
  value: Exclude<RequestType, "">;
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

const URGENCY_OPTIONS: { value: Exclude<Urgency, "">; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const STEP_LABELS = ["Request type", "Details", "Review"] as const;

const STEP_FIELDS: Record<Step, string[]> = {
  1: ["requestType"],
  2: ["subject", "description", "urgency"],
  3: [],
};

const EMPTY_FORM: FormState = {
  requestType: "",
  subject: "",
  description: "",
  urgency: "",
  fileName: "",
};

function validateStep(step: Step, data: FormState): ValidationError[] {
  const errs: ValidationError[] = [];
  if (step === 1) {
    if (!data.requestType) {
      errs.push({ field: "requestType", message: "Choose a request type." });
    }
  } else if (step === 2) {
    if (!data.subject.trim()) {
      errs.push({ field: "subject", message: "Enter a subject." });
    } else if (data.subject.trim().length < 3) {
      errs.push({
        field: "subject",
        message: "Subject must be at least 3 characters.",
      });
    }
    if (!data.description.trim()) {
      errs.push({ field: "description", message: "Enter a description." });
    } else if (data.description.trim().length < 10) {
      errs.push({
        field: "description",
        message: "Description must be at least 10 characters.",
      });
    }
    if (!data.urgency) {
      errs.push({ field: "urgency", message: "Choose an urgency level." });
    }
  }
  return errs;
}

export default function ServiceRequestPage() {
  const [step, setStep] = useState<Step>(1);
  const [data, setData] = useState<FormState>(EMPTY_FORM);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttemptCount, setSubmitAttemptCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<Confirmed | null>(null);
  const [fileAnnouncement, setFileAnnouncement] = useState("");

  const errorSummaryRef = useRef<HTMLDivElement>(null);

  const errors = validateStep(step, data);
  const submitAttempted = submitAttemptCount > 0;

  // submitAttemptCount increments on each failed Next click. We re-focus the
  // summary on every increment, but not when `errors` changes from typing,
  // since that would steal focus while the user is editing.
  useEffect(() => {
    if (submitAttemptCount > 0) {
      errorSummaryRef.current?.focus();
    }
  }, [submitAttemptCount]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function markTouched(field: string) {
    setTouched((t) => (t[field] ? t : { ...t, [field]: true }));
  }

  function resetStepFlags() {
    setSubmitAttemptCount(0);
    setTouched({});
  }

  function goToStep(next: Step) {
    setStep(next);
    resetStepFlags();
  }

  function handleNext() {
    const errs = validateStep(step, data);
    if (errs.length > 0) {
      const allTouched = Object.fromEntries(
        STEP_FIELDS[step].map((f) => [f, true]),
      );
      setTouched((t) => ({ ...t, ...allTouched }));
      setSubmitAttemptCount((c) => c + 1);
      return;
    }
    if (step < 3) goToStep((step + 1) as Step);
  }

  function handleBack() {
    if (step > 1) goToStep((step - 1) as Step);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (step !== 3 || submitting) return;
    setSubmitting(true);
    setTimeout(() => {
      const num = Math.floor(Math.random() * 90000) + 10000;
      const id = `SR-2026-${num}`;
      setConfirmed({ id, data });
      setSubmitting(false);
    }, 1000);
  }

  function resetAll() {
    setData(EMPTY_FORM);
    setTouched({});
    setSubmitAttemptCount(0);
    setStep(1);
    setConfirmed(null);
    setFileAnnouncement("");
  }

  function focusField(field: string) {
    if (field === "requestType") {
      const id = data.requestType
        ? `rt-${data.requestType}`
        : `rt-${REQUEST_TYPES[0].value}`;
      document.getElementById(id)?.focus();
      return;
    }
    document.getElementById(field)?.focus();
  }

  function fieldErrorMessage(field: string): string | undefined {
    if (!touched[field] && !submitAttempted) return undefined;
    return errors.find((e) => e.field === field)?.message;
  }

  if (confirmed) {
    return (
      <Confirmation
        id={confirmed.id}
        data={confirmed.data}
        onReset={resetAll}
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm font-medium text-blue-800 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to home
      </Link>

      <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
        Service request
      </h1>
      <p className="mt-2 text-gray-700">
        Submit a request to IT, Facilities, HR, or Procurement. This is a demo —
        no data is sent.
      </p>

      <StepIndicator step={step} />

      {submitAttempted && errors.length > 0 && (
        <ErrorSummary
          ref={errorSummaryRef}
          errors={errors}
          onErrorClick={focusField}
        />
      )}

      <form onSubmit={handleSubmit} noValidate>
        {step === 1 && (
          <Step1
            value={data.requestType}
            onChange={(v) => updateField("requestType", v as RequestType)}
            onBlur={() => markTouched("requestType")}
            errorMessage={fieldErrorMessage("requestType")}
          />
        )}
        {step === 2 && (
          <Step2
            data={data}
            updateField={updateField}
            markTouched={markTouched}
            getFieldError={fieldErrorMessage}
            fileAnnouncement={fileAnnouncement}
            setFileAnnouncement={setFileAnnouncement}
          />
        )}
        {step === 3 && <Step3 data={data} onEdit={(s) => goToStep(s)} />}

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 pt-6">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1 || submitting}
            className="inline-flex items-center gap-2 rounded-md border-2 border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 rounded-md bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
            >
              Next
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="submit"
              aria-busy={submitting}
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-md bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-80"
            >
              {submitting ? (
                <>
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                  Submitting…
                </>
              ) : (
                "Submit request"
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function StepIndicator({ step }: { step: Step }) {
  const value = (step / STEP_LABELS.length) * 100;
  return (
    <nav aria-label="Form progress" className="mt-8">
      <ol className="flex flex-wrap items-center gap-x-6 gap-y-3">
        {STEP_LABELS.map((label, idx) => {
          const num = (idx + 1) as Step;
          const isCurrent = num === step;
          const isComplete = num < step;
          return (
            <li
              key={label}
              {...(isCurrent ? { "aria-current": "step" as const } : {})}
              className="flex items-center gap-2 text-sm"
            >
              <span
                aria-hidden="true"
                className={clsx(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold",
                  isCurrent && "border-blue-700 bg-blue-700 text-white",
                  isComplete && "border-blue-700 bg-white text-blue-700",
                  !isCurrent &&
                    !isComplete &&
                    "border-gray-300 bg-white text-gray-700",
                )}
              >
                {isComplete ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  num
                )}
              </span>
              <span
                className={clsx(
                  "font-medium",
                  isCurrent
                    ? "text-blue-800"
                    : isComplete
                      ? "text-blue-800"
                      : "text-gray-700",
                )}
              >
                <span className="sr-only">
                  {isComplete
                    ? "Completed: "
                    : isCurrent
                      ? "Current step: "
                      : "Upcoming: "}
                </span>
                Step {num} of {STEP_LABELS.length}: {label}
              </span>
            </li>
          );
        })}
      </ol>
      <Progress.Root
        value={value}
        max={100}
        aria-label={`Step ${step} of ${STEP_LABELS.length}`}
        className="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-200"
      >
        <Progress.Indicator
          className="h-full bg-blue-700 transition-transform duration-300"
          style={{ transform: `translateX(-${100 - value}%)` }}
        />
      </Progress.Root>
    </nav>
  );
}

function ErrorSummary({
  ref,
  errors,
  onErrorClick,
}: {
  ref: RefObject<HTMLDivElement | null>;
  errors: ValidationError[];
  onErrorClick: (field: string) => void;
}) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      ref={ref}
      tabIndex={-1}
      className="mt-8 rounded-md border-2 border-red-700 bg-red-50 p-4 focus-visible:outline-2 focus-visible:outline-blue-700"
    >
      <h2 className="text-base font-semibold text-red-800">
        Please fix {errors.length} error{errors.length === 1 ? "" : "s"} before
        continuing:
      </h2>
      <ul className="mt-2 list-disc space-y-1 pl-6">
        {errors.map((e) => (
          <li key={e.field}>
            <a
              href={`#${e.field}`}
              onClick={(ev) => {
                ev.preventDefault();
                onErrorClick(e.field);
              }}
              className="font-medium text-red-800 underline hover:text-red-900"
            >
              {e.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Step1({
  value,
  onChange,
  onBlur,
  errorMessage,
}: {
  value: RequestType;
  onChange: (v: string) => void;
  onBlur: () => void;
  errorMessage: string | undefined;
}) {
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const helpId = "requestType-help";
  const errorId = "requestType-error";
  return (
    <section aria-labelledby="step1-heading" className="mt-8">
      <h2
        id="step1-heading"
        ref={headingRef}
        tabIndex={-1}
        className="text-2xl font-bold text-gray-900 focus-visible:outline-none"
      >
        Step 1 of 3: Request type
      </h2>
      <p id={helpId} className="mt-2 text-gray-700">
        Choose the area your request relates to.
      </p>

      <RadioGroup.Root
        value={value || undefined}
        onValueChange={onChange}
        aria-required="true"
        aria-invalid={Boolean(errorMessage)}
        aria-describedby={clsx(helpId, errorMessage && errorId)}
        onBlur={onBlur}
        className="mt-6 grid gap-3"
      >
        {REQUEST_TYPES.map((rt) => {
          const inputId = `rt-${rt.value}`;
          const isSelected = value === rt.value;
          return (
            <label
              key={rt.value}
              htmlFor={inputId}
              className={clsx(
                "flex cursor-pointer items-start gap-3 rounded-md border-2 p-4 transition-colors",
                isSelected
                  ? "border-blue-700 bg-blue-50"
                  : "border-gray-300 bg-white hover:border-blue-400",
              )}
            >
              <RadioGroup.Item
                id={inputId}
                value={rt.value}
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-gray-500 bg-white data-[state=checked]:border-blue-700 data-[state=checked]:bg-blue-700"
              >
                <RadioGroup.Indicator className="block h-2 w-2 rounded-full bg-white" />
              </RadioGroup.Item>
              <span>
                <span className="block font-semibold text-gray-900">
                  {rt.label}
                </span>
                <span className="block text-sm text-gray-700">
                  {rt.description}
                </span>
              </span>
            </label>
          );
        })}
      </RadioGroup.Root>

      {errorMessage && (
        <p id={errorId} className="mt-3 text-sm font-medium text-red-700">
          {errorMessage}
        </p>
      )}
    </section>
  );
}

function Step2({
  data,
  updateField,
  markTouched,
  getFieldError,
  fileAnnouncement,
  setFileAnnouncement,
}: {
  data: FormState;
  updateField: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  markTouched: (field: string) => void;
  getFieldError: (field: string) => string | undefined;
  fileAnnouncement: string;
  setFileAnnouncement: (s: string) => void;
}) {
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const subjectError = getFieldError("subject");
  const descriptionError = getFieldError("description");
  const urgencyError = getFieldError("urgency");

  function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      updateField("fileName", file.name);
      setFileAnnouncement(`Selected file: ${file.name}`);
    }
  }

  return (
    <section aria-labelledby="step2-heading" className="mt-8">
      <h2
        id="step2-heading"
        ref={headingRef}
        tabIndex={-1}
        className="text-2xl font-bold text-gray-900 focus-visible:outline-none"
      >
        Step 2 of 3: Details
      </h2>
      <p className="mt-2 text-gray-700">Tell us what you need.</p>

      <div className="mt-6 space-y-6">
        <div>
          <label
            htmlFor="subject"
            className="block text-sm font-semibold text-gray-900"
          >
            Subject{" "}
            <span aria-hidden="true" className="text-red-700">
              *
            </span>
          </label>
          <p id="subject-help" className="mt-1 text-sm text-gray-600">
            Short summary, e.g. &quot;Laptop won&apos;t boot&quot;.
          </p>
          <input
            type="text"
            id="subject"
            name="subject"
            value={data.subject}
            onChange={(e) => updateField("subject", e.target.value)}
            onBlur={() => markTouched("subject")}
            aria-required="true"
            aria-invalid={Boolean(subjectError)}
            aria-describedby={clsx(
              "subject-help",
              subjectError && "subject-error",
            )}
            className={clsx(
              "mt-2 block w-full rounded-md border-2 px-3 py-2 text-base text-gray-900",
              subjectError ? "border-red-700" : "border-gray-300",
            )}
          />
          {subjectError && (
            <p
              id="subject-error"
              className="mt-1 text-sm font-medium text-red-700"
            >
              {subjectError}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-semibold text-gray-900"
          >
            Description{" "}
            <span aria-hidden="true" className="text-red-700">
              *
            </span>
          </label>
          <p id="description-help" className="mt-1 text-sm text-gray-600">
            Provide enough detail for someone to act on your request (10+
            characters).
          </p>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={data.description}
            onChange={(e) => updateField("description", e.target.value)}
            onBlur={() => markTouched("description")}
            aria-required="true"
            aria-invalid={Boolean(descriptionError)}
            aria-describedby={clsx(
              "description-help",
              descriptionError && "description-error",
            )}
            className={clsx(
              "mt-2 block w-full rounded-md border-2 px-3 py-2 text-base text-gray-900",
              descriptionError ? "border-red-700" : "border-gray-300",
            )}
          />
          {descriptionError && (
            <p
              id="description-error"
              className="mt-1 text-sm font-medium text-red-700"
            >
              {descriptionError}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="urgency"
            className="block text-sm font-semibold text-gray-900"
          >
            Urgency{" "}
            <span aria-hidden="true" className="text-red-700">
              *
            </span>
          </label>
          <p id="urgency-help" className="mt-1 text-sm text-gray-600">
            How quickly does this need attention?
          </p>
          <Select.Root
            value={data.urgency || undefined}
            onValueChange={(v) => {
              updateField("urgency", v as Urgency);
              markTouched("urgency");
            }}
          >
            <Select.Trigger
              id="urgency"
              aria-required="true"
              aria-invalid={Boolean(urgencyError)}
              aria-describedby={clsx(
                "urgency-help",
                urgencyError && "urgency-error",
              )}
              onBlur={() => markTouched("urgency")}
              className={clsx(
                "mt-2 inline-flex w-full items-center justify-between rounded-md border-2 bg-white px-3 py-2 text-base text-gray-900 data-[placeholder]:text-gray-500",
                urgencyError ? "border-red-700" : "border-gray-300",
              )}
            >
              <Select.Value placeholder="Select urgency" />
              <Select.Icon>
                <ChevronDown
                  className="h-4 w-4 text-gray-700"
                  aria-hidden="true"
                />
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content
                position="popper"
                sideOffset={4}
                className="z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border border-gray-300 bg-white shadow-lg"
              >
                <Select.Viewport className="p-1">
                  {URGENCY_OPTIONS.map((o) => (
                    <Select.Item
                      key={o.value}
                      value={o.value}
                      className="relative flex cursor-pointer select-none items-center gap-2 rounded px-3 py-2 text-base text-gray-900 data-[highlighted]:bg-blue-100 data-[highlighted]:text-blue-900 data-[highlighted]:outline-none"
                    >
                      <Select.ItemIndicator>
                        <Check
                          className="h-4 w-4 text-blue-700"
                          aria-hidden="true"
                        />
                      </Select.ItemIndicator>
                      <Select.ItemText>{o.label}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
          {urgencyError && (
            <p
              id="urgency-error"
              className="mt-1 text-sm font-medium text-red-700"
            >
              {urgencyError}
            </p>
          )}
        </div>

        <div>
          <span className="block text-sm font-semibold text-gray-900">
            Attachment (optional)
          </span>
          <p id="attachment-help" className="mt-1 text-sm text-gray-600">
            Add a screenshot or document to support your request.
          </p>
          <button
            type="button"
            id="attachment"
            onClick={() => fileInputRef.current?.click()}
            aria-describedby="attachment-help"
            className="mt-2 inline-flex items-center gap-2 rounded-md border-2 border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
          >
            <Paperclip className="h-4 w-4" aria-hidden="true" />
            {data.fileName ? `Replace file: ${data.fileName}` : "Choose file"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            tabIndex={-1}
            aria-hidden="true"
            className="sr-only"
            onChange={handleFileSelect}
          />
          <span aria-live="polite" className="sr-only">
            {fileAnnouncement}
          </span>
          {data.fileName && (
            <p className="mt-2 text-sm text-gray-700">
              Attached: {data.fileName}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function Step3({
  data,
  onEdit,
}: {
  data: FormState;
  onEdit: (step: Step) => void;
}) {
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const reqType =
    REQUEST_TYPES.find((r) => r.value === data.requestType)?.label ?? "—";
  const urgency =
    URGENCY_OPTIONS.find((u) => u.value === data.urgency)?.label ?? "—";

  const rows: { label: string; value: string; editStep: Step; key: string }[] =
    [
      { label: "Request type", value: reqType, editStep: 1, key: "requestType" },
      { label: "Subject", value: data.subject, editStep: 2, key: "subject" },
      {
        label: "Description",
        value: data.description,
        editStep: 2,
        key: "description",
      },
      { label: "Urgency", value: urgency, editStep: 2, key: "urgency" },
      {
        label: "Attachment",
        value: data.fileName || "None",
        editStep: 2,
        key: "attachment",
      },
    ];

  return (
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
              <dt className="text-sm font-medium text-gray-600">{row.label}</dt>
              <dd className="mt-0.5 break-words whitespace-pre-wrap text-base text-gray-900">
                {row.value}
              </dd>
            </div>
            <button
              type="button"
              onClick={() => onEdit(row.editStep)}
              className="shrink-0 text-sm font-semibold text-blue-800 underline hover:text-blue-900"
            >
              Edit
              <span className="sr-only"> {row.label.toLowerCase()}</span>
            </button>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Confirmation({
  id,
  data,
  onReset,
}: {
  id: string;
  data: FormState;
  onReset: () => void;
}) {
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const reqType =
    REQUEST_TYPES.find((r) => r.value === data.requestType)?.label ?? "—";
  const urgency =
    URGENCY_OPTIONS.find((u) => u.value === data.urgency)?.label ?? "—";

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
            <dd className="text-base text-gray-900">{reqType}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-600">Urgency</dt>
            <dd className="text-base text-gray-900">{urgency}</dd>
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

      <button
        type="button"
        onClick={onReset}
        className="mt-8 inline-flex items-center gap-2 rounded-md bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
      >
        Submit another request
      </button>
    </div>
  );
}
