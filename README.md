# Accessible Portfolio — Forms and Data

A small Next.js portfolio centered on the parts of web apps users most often
struggle with: long forms and dense dashboards. Accessibility is the
differentiator, not an afterthought — every page is built to work for
keyboard users and screen-reader users from the start.

## Projects

- **[Service request form](app/projects/service-request)** — a three-step
  form modelled as an explicit state machine (filling /
  submitting / success / error), submitting via Server Actions with cookie-
  backed state so it works with JavaScript disabled. Includes a typed schema,
  field-level error library with documented rules, draft-save to localStorage
  with a recovery banner, optimistic UI with simulated 10% failure rollback,
  telemetry events, an accessible custom-styled file input, and a
  [WCAG 2.1 conformance report](app/projects/service-request/about) at
  `/projects/service-request/about`. State machine documented in
  [`docs/form-state-machine.md`](docs/form-state-machine.md).
- **[Analytics dashboard](app/projects/analytics)** — a read-only dashboard
  with **URL-driven filter state** (refresh keeps the view, share the link
  shares the view), **streaming Suspense** for each chart (KPIs render
  immediately while charts stream in), and three layers of chart
  accessibility: a plain-English summary, a sr-only `<table>` fallback, and
  a "View as data" toggle that swaps the chart for a visible table. The line
  chart additionally **sonifies** the trend so screen-reader users can hear
  the shape. Filter changes are announced through a single debounced
  announcer; rapid changes coalesce into one screen-reader message. **Export
  CSV** captures the currently filtered view with proper RFC-4180-ish
  escaping, including a comment-row preamble describing the active filter.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Radix UI primitives
(`react-radio-group`, `react-select`, `react-progress`) · Recharts ·
`lucide-react` · `clsx` · plain `useState` / `useReducer` for state. No data
fetching, no auth, no backend.

A note on Radix: the form deliberately uses native `<input type="radio">`
and `<select>` rather than Radix RadioGroup / Select, because Radix renders
`<button role="radio">` which doesn't participate in form submission. The
trade-off is intentional — true progressive enhancement on the form was
worth more than the visual polish of Radix's primitives. The dashboard,
which is JS-driven, uses Radix throughout.

## Running locally

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Performance budgets

Targets, measured on a clean Lighthouse run on a deployed build (Vercel,
free tier):

| Metric | Budget | Why |
|---|---|---|
| TTFB | ≤ 600 ms | Page is statically prerendered for `/` and the WCAG report; service-request and analytics are dynamic but cookie/searchparams reads are O(1). |
| LCP | ≤ 2 500 ms | KPI cards render server-side and don't wait on the chart streams. |
| INP | ≤ 200 ms | Filter changes are wrapped in `useTransition`; chart streams don't block input. |
| CLS | ≤ 0.05 | Chart skeletons reserve final height (`h-72`) so charts don't shift the page on stream-in. |

The biggest cost on the page is **Recharts** (≈400 kB minified, ≈110 kB
gzipped) — it's most of the dashboard's client bundle. We accept the cost
for this portfolio because the brief locks the chart library; in a real
project at this size, [Visx](https://airbnb.io/visx/) would be a smaller
alternative at the cost of a custom render layer per chart type.

To inspect the bundle yourself:

```bash
ANALYZE=true npm run build
```

Outputs interactive treemaps to `.next/analyze/`. Compare client.html
against any candidate replacement before deciding to swap a dependency.

## Accessibility

Tested with NVDA, Lighthouse, and axe-core. Targets WCAG 2.1 AA. The form
ships an explicit conformance report at `/projects/service-request/about`.
