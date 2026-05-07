"use server";

// Server Actions for the service request form.
//
// **Progressive enhancement model.** Every action ends in a `redirect`.
// Without JavaScript, the browser submits the form, the action runs on the
// server, sets the cookie with the next state, and the browser follows the
// redirect to re-render the page. With JavaScript, App Router intercepts the
// redirect and does client-side navigation — same outcome, no full reload.
//
// We don't return an `ActionResult` from these actions because, without JS,
// nothing on the client could read it. Errors are written into the cookie
// and the page re-renders showing them. This keeps both code paths identical.

import { redirect } from "next/navigation";
import {
  EMPTY_FORM_DATA,
  FIELDS_BY_STEP,
  validateStep,
  type FormData,
  type StepId,
} from "./schema";
import {
  clearServerState,
  readServerState,
  writeServerState,
  type ServerState,
} from "./state-cookie";
import { genericMessage } from "@/lib/errors";

const FORM_ROUTE = "/projects/service-request";
const FAILURE_RATE = 0.1;

function readFormFields(formData: globalThis.FormData): Partial<FormData> {
  const get = (k: string) => {
    const v = formData.get(k);
    return typeof v === "string" ? v : "";
  };
  const file = formData.get("attachment");
  const fileName =
    file && typeof file === "object" && "name" in file
      ? (file as File).name || ""
      : "";
  return {
    requestType: get("requestType") as FormData["requestType"],
    subject: get("subject"),
    description: get("description"),
    urgency: get("urgency") as FormData["urgency"],
    fileName: fileName || undefined,
  };
}

function mergeData(
  current: FormData,
  step: StepId,
  incoming: Partial<FormData>,
): FormData {
  if (step === 3) return current;
  const merged: FormData = { ...current };
  for (const fieldId of FIELDS_BY_STEP[step]) {
    if (incoming[fieldId] === undefined) continue;
    if (fieldId === "requestType") {
      merged.requestType = (incoming.requestType ?? "") as FormData["requestType"];
    } else if (fieldId === "urgency") {
      merged.urgency = (incoming.urgency ?? "") as FormData["urgency"];
    } else {
      merged[fieldId] = String(incoming[fieldId] ?? "");
    }
  }
  // File input is only on step 2 and is empty if the user didn't pick a new
  // one this round — preserve any prior fileName.
  if (step === 2 && !incoming.fileName) {
    merged.fileName = current.fileName;
  }
  return merged;
}

export async function advanceStep(
  formData: globalThis.FormData,
): Promise<void> {
  const state = await readServerState();
  if (state.phase !== "filling") redirect(FORM_ROUTE);
  const currentStep = state.step;

  if (currentStep === 3) {
    // Step 3 advance == final submit.
    await submitInternal(state.data);
    return;
  }

  const incoming = readFormFields(formData);
  const merged = mergeData(state.data, currentStep, incoming);
  const errors = validateStep(currentStep, merged);
  if (errors.length > 0) {
    await writeServerState({
      phase: "filling",
      step: currentStep,
      data: merged,
      errors,
    });
    redirect(FORM_ROUTE);
  }
  await writeServerState({
    phase: "filling",
    step: (currentStep + 1) as StepId,
    data: merged,
  });
  redirect(FORM_ROUTE);
}

export async function goBack(): Promise<void> {
  const state = await readServerState();
  if (state.phase !== "filling") redirect(FORM_ROUTE);
  if (state.step === 1) redirect(FORM_ROUTE);
  await writeServerState({
    phase: "filling",
    step: (state.step - 1) as StepId,
    data: state.data,
  });
  redirect(FORM_ROUTE);
}

export async function goToStep(formData: globalThis.FormData): Promise<void> {
  const target = Number(formData.get("step"));
  if (target !== 1 && target !== 2 && target !== 3) redirect(FORM_ROUTE);
  const state = await readServerState();
  await writeServerState({
    phase: "filling",
    step: target as StepId,
    data: state.phase === "filling" ? state.data : EMPTY_FORM_DATA,
  });
  redirect(FORM_ROUTE);
}

async function submitInternal(data: FormData): Promise<void> {
  // Simulate latency.
  await new Promise((res) => setTimeout(res, 1000));
  if (Math.random() < FAILURE_RATE) {
    await writeServerState({
      phase: "error",
      data,
      message: genericMessage("SUBMIT_FAILED"),
    });
    redirect(FORM_ROUTE);
  }
  const num = Math.floor(Math.random() * 90000) + 10000;
  const requestId = `SR-2026-${num}`;
  await writeServerState({ phase: "success", data, requestId });
  redirect(FORM_ROUTE);
}

export async function submitRequest(): Promise<void> {
  const state = await readServerState();
  if (state.phase !== "filling" || state.step !== 3) redirect(FORM_ROUTE);
  await submitInternal(state.data);
}

export async function retrySubmit(): Promise<void> {
  const state = await readServerState();
  if (state.phase !== "error") redirect(FORM_ROUTE);
  await writeServerState({
    phase: "filling",
    step: 3,
    data: state.data,
  });
  redirect(FORM_ROUTE);
}

export async function resetForm(): Promise<void> {
  await clearServerState();
  redirect(FORM_ROUTE);
}

// Used when the client restores a draft from localStorage and wants the
// server to seed its cookie state to match. Without JS this is unreachable.
export async function loadDraftToServer(
  formData: globalThis.FormData,
): Promise<void> {
  const incoming: FormData = {
    requestType: (formData.get("requestType") as FormData["requestType"]) || "",
    subject: String(formData.get("subject") ?? ""),
    description: String(formData.get("description") ?? ""),
    urgency: (formData.get("urgency") as FormData["urgency"]) || "",
    fileName: String(formData.get("fileName") ?? ""),
  };
  const stepRaw = Number(formData.get("step"));
  const step: StepId = stepRaw === 2 || stepRaw === 3 ? (stepRaw as StepId) : 1;
  const next: ServerState = {
    phase: "filling",
    step,
    data: incoming,
  };
  await writeServerState(next);
  redirect(FORM_ROUTE);
}
