// Typed product-telemetry events.
//
// The shape of these events is the deliverable, not the sink. A real
// installation would wire `setSink` to PostHog / Segment / GA. Here the
// default sink writes to `console` so the events are visible in DevTools.
//
// Why not just `track('eventName', payload)`? Because `eventName` collisions
// and free-form payloads are how analytics dashboards become unreliable.
// A discriminated union forces every event to have a known shape, and
// changes to the shape are caught at the type level.

export type TelemetryEvent =
  | { type: "form_step_entered"; step: number }
  | { type: "form_step_completed"; step: number; durationMs: number }
  | {
      type: "form_field_errored";
      field: string;
      code: string;
    }
  | {
      type: "form_abandoned";
      step: number;
      filledFields: number;
    }
  | {
      type: "form_submitted";
      success: boolean;
      requestId?: string;
      attempt: number;
    }
  | {
      type: "dashboard_filter_changed";
      filter: "department" | "range";
      value: string;
    }
  | {
      type: "dashboard_export_csv";
      rows: number;
    };

export type Sink = (
  event: TelemetryEvent & { timestamp: string },
) => void;

const defaultSink: Sink = (event) => {

  console.log("[telemetry]", event);
};

let sink: Sink = defaultSink;

export function setTelemetrySink(s: Sink): void {
  sink = s;
}

export function track(event: TelemetryEvent): void {
  sink({ ...event, timestamp: new Date().toISOString() });
}
