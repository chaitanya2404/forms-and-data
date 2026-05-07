// Server-side cookie state for the service request form.
//
// This is the shared state between Server Actions and the server-rendered
// page. It's what enables progressive enhancement: without JS, the cookie is
// the source of truth between full page reloads. With JS, the client mirrors
// the cookie into a local reducer for snappy in-step UX, but the cookie still
// drives navigation between steps.
//
// The cookie isn't signed/encrypted — it's a portfolio demo with mock data
// only. A production version would use iron-session or similar.

import { cookies } from "next/headers";
import {
  EMPTY_FORM_DATA,
  type FormData,
  type StepId,
  type ValidationError,
} from "./schema";

const COOKIE_NAME = "sr-form-state";
const COOKIE_PATH = "/projects/service-request";
const COOKIE_MAX_AGE = 60 * 60 * 4; // 4 hours

export type ServerState =
  | {
      phase: "filling";
      step: StepId;
      data: FormData;
      errors?: ValidationError[];
    }
  | {
      phase: "success";
      data: FormData;
      requestId: string;
    }
  | {
      phase: "error";
      data: FormData;
      message: string;
    };

const INITIAL: ServerState = {
  phase: "filling",
  step: 1,
  data: EMPTY_FORM_DATA,
};

export async function readServerState(): Promise<ServerState> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return INITIAL;
  try {
    const decoded = decodeURIComponent(raw);
    const parsed = JSON.parse(decoded) as ServerState;
    if (parsed && typeof parsed === "object" && "phase" in parsed) {
      return parsed;
    }
    return INITIAL;
  } catch {
    return INITIAL;
  }
}

export async function writeServerState(state: ServerState): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, encodeURIComponent(JSON.stringify(state)), {
    sameSite: "lax",
    path: COOKIE_PATH,
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function clearServerState(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
