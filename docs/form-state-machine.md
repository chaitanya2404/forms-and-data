# Service request form — state machine

The service request form is modelled as an explicit state machine rather than
a tangle of `if (step === 2)` checks scattered across components. The states,
events, and transitions live in
[`app/projects/service-request/machine.ts`](../app/projects/service-request/machine.ts);
this document is the diagram and the contract.

## States

```
            ┌────────────────────────────┐
            │  filling                   │
            │  ── step 1 ─ step 2 ─ step 3
            │  + submitAttempted: bool   │
            │  + touched: Set<FieldId>   │
            └────────────────────────────┘
                       │  SUBMIT_START
                       ▼
            ┌────────────────────────────┐
            │  submitting                │
            │  + optimisticRequestId     │
            └────────────────────────────┘
              ╱                     ╲
SUBMIT_SUCCESS                 SUBMIT_FAILURE
            ▼                       ▼
    ┌──────────────┐        ┌──────────────┐
    │  success     │        │  error       │
    │  + requestId │        │  + message   │
    └──────────────┘        └──────────────┘
                                    │  RETRY
                                    ▼
                              filling step 3
```

Every state carries the `data: FormData` accumulated so far. Universal events
(`RESET`) are accepted from every state and return to the initial filling /
step 1 / empty state.

## Events

| Event | Payload | Allowed from |
|---|---|---|
| `UPDATE_FIELD` | `{ field, value }` | `filling` |
| `BLUR` | `{ field }` | `filling` |
| `LOAD_DRAFT` | `{ data }` | `filling` |
| `NEXT` | — | `filling` (validates current step) |
| `BACK` | — | `filling` (no-op on step 1) |
| `EDIT` | `{ step }` | `filling` (any step) |
| `SUBMIT_START` | `{ optimisticRequestId }` | `filling` step 3 only |
| `SUBMIT_SUCCESS` | `{ requestId }` | `submitting` |
| `SUBMIT_FAILURE` | `{ message }` | `submitting` |
| `RETRY` | — | `error` |
| `RESET` | — | any |

Unrecognised `(state, event)` combinations return the state unchanged. There
are no implicit transitions.

## Validation

Validation is a pure function over `(step, data)` defined in
[`schema.ts`](../app/projects/service-request/schema.ts). It is **not** a state-
machine event — it's read by the `NEXT` handler to decide whether to advance.
The same validator runs on the server (inside the Server Action) and on the
client (for live blur feedback). Same code, two callers.

## Where the machine actually runs

The state machine has two implementations that share the schema:

1. **Client** (`useReducer` in step components) — drives in-step UX:
   `touched`, `submitAttempted`, optimistic submit indicator.
2. **Server** (Server Actions in `actions.ts` + cookie state in
   `state-cookie.ts`) — drives the navigation transitions: which step to
   render, validation as source of truth, success/error phase.

Both implementations conform to the same transition table. The server is
authoritative; the client is reactive. Without JavaScript, only the server
implementation runs — every transition is a real form submission and a real
redirect. With JavaScript, the client implementation provides instant
feedback, but the server still runs on every navigation and remains the
source of truth.

## Why hand-rolled and not XState

XState would be the canonical answer, but the brief locks the dependency
list to React + Radix + Recharts + lucide + clsx, and the form's transition
table is small enough to encode in 60 lines of TypeScript. The cost of an
extra dependency wasn't justified. If the form grew to include nested
sub-flows, parallel sections, or guarded transitions with side effects,
XState would become the right call.
