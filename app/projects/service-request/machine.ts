// Hand-rolled state machine for the service request form.
//
// States (the `kind` discriminator):
//   - filling      — user is editing one of the three steps
//   - submitting   — final submit in flight (optimistic; request id is
//                    shown immediately and confirmed on success)
//   - success      — terminal: confirmation page
//   - error        — submit failed; user can RETRY back to filling step 3
//
// See docs/form-state-machine.md for the full transition diagram.

import {
  EMPTY_FORM_DATA,
  type FieldId,
  type FormData,
  type StepId,
  type ValidationError,
  validateStep,
} from "./schema";

export type FillingState = {
  kind: "filling";
  step: StepId;
  data: FormData;
  // True after the user has clicked "Next" or "Submit" with errors —
  // controls whether to render the error summary and inline errors.
  submitAttempted: boolean;
  touched: ReadonlySet<FieldId>;
};

export type SubmittingState = {
  kind: "submitting";
  data: FormData;
  optimisticRequestId: string;
};

export type SuccessState = {
  kind: "success";
  data: FormData;
  requestId: string;
};

export type ErrorState = {
  kind: "error";
  data: FormData;
  message: string;
};

export type FormState =
  | FillingState
  | SubmittingState
  | SuccessState
  | ErrorState;

export type FormEvent =
  | { type: "UPDATE_FIELD"; field: FieldId; value: string }
  | { type: "BLUR"; field: FieldId }
  | { type: "NEXT" }
  | { type: "BACK" }
  | { type: "EDIT"; step: StepId }
  | { type: "SUBMIT_START"; optimisticRequestId: string }
  | { type: "SUBMIT_SUCCESS"; requestId: string }
  | { type: "SUBMIT_FAILURE"; message: string }
  | { type: "RETRY" }
  | { type: "RESET" }
  | { type: "LOAD_DRAFT"; data: FormData };

export const INITIAL_STATE: FillingState = {
  kind: "filling",
  step: 1,
  data: EMPTY_FORM_DATA,
  submitAttempted: false,
  touched: new Set(),
};

function withTouched(
  prev: ReadonlySet<FieldId>,
  field: FieldId,
): ReadonlySet<FieldId> {
  if (prev.has(field)) return prev;
  const next = new Set(prev);
  next.add(field);
  return next;
}

function resetStepFlags(state: FillingState, step: StepId): FillingState {
  return {
    ...state,
    step,
    submitAttempted: false,
    touched: new Set(),
  };
}

export function reducer(state: FormState, event: FormEvent): FormState {
  // Universal events first.
  if (event.type === "RESET") return INITIAL_STATE;

  switch (state.kind) {
    case "filling": {
      switch (event.type) {
        case "UPDATE_FIELD":
          return {
            ...state,
            data: { ...state.data, [event.field]: event.value },
          };
        case "BLUR":
          return { ...state, touched: withTouched(state.touched, event.field) };
        case "LOAD_DRAFT":
          return { ...state, data: event.data };
        case "NEXT": {
          if (state.step === 3) {
            // step 3 has no per-field validation; final submit happens via
            // SUBMIT_START.
            return state;
          }
          const errors = validateStep(state.step, state.data);
          if (errors.length > 0) {
            // Mark all fields on this step touched so inline errors show.
            const next = new Set(state.touched);
            for (const e of errors) next.add(e.field);
            return { ...state, submitAttempted: true, touched: next };
          }
          return resetStepFlags(state, (state.step + 1) as StepId);
        }
        case "BACK": {
          if (state.step === 1) return state;
          return resetStepFlags(state, (state.step - 1) as StepId);
        }
        case "EDIT":
          return resetStepFlags(state, event.step);
        case "SUBMIT_START":
          if (state.step !== 3) return state;
          return {
            kind: "submitting",
            data: state.data,
            optimisticRequestId: event.optimisticRequestId,
          };
        default:
          return state;
      }
    }
    case "submitting": {
      switch (event.type) {
        case "SUBMIT_SUCCESS":
          return {
            kind: "success",
            data: state.data,
            requestId: event.requestId,
          };
        case "SUBMIT_FAILURE":
          return {
            kind: "error",
            data: state.data,
            message: event.message,
          };
        default:
          return state;
      }
    }
    case "error": {
      if (event.type === "RETRY") {
        return {
          kind: "filling",
          step: 3,
          data: state.data,
          submitAttempted: false,
          touched: new Set(),
        };
      }
      return state;
    }
    case "success":
      return state;
  }
}

// Helper: compute validation errors for the current state's step (only
// meaningful while filling).
export function currentErrors(state: FormState): ValidationError[] {
  if (state.kind !== "filling") return [];
  if (state.step === 3) return [];
  return validateStep(state.step, state.data);
}

export function shouldShowFieldError(
  state: FormState,
  field: FieldId,
): boolean {
  if (state.kind !== "filling") return false;
  return state.submitAttempted || state.touched.has(field);
}
