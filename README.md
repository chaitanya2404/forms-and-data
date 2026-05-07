# Accessible Portfolio — Forms and Data

A small Next.js portfolio centered on the parts of web apps users most often
struggle with: long forms and dense dashboards. Accessibility is the
differentiator, not an afterthought — every page is built to work for keyboard
users and screen-reader users from the start.

## Projects

- **[Service request form](/projects/service-request)** — a three-step form
  with inline validation, an error summary that takes focus on failed submit,
  managed focus between steps, a screen-reader-friendly file input, and a
  confirmation page with a fake request ID.
- **[Analytics dashboard](/projects/analytics)** — a read-only dashboard with
  Radix-based filters, three KPI cards, and three Recharts visualisations
  (line, bar, pie). Each chart includes a plain-English summary, a
  visually-hidden data table fallback, and a `role="img"` wrapper with a
  descriptive `aria-label`. Filter changes are announced via an `aria-live`
  region.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Radix UI primitives
(`react-radio-group`, `react-select`, `react-progress`) · Recharts ·
`lucide-react` · `clsx` · plain `useState` for state.

No data fetching, no auth, no backend — both projects use hardcoded data and
local component state.

## Running locally

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Accessibility

Tested with NVDA, Lighthouse, and axe-core. Targets WCAG 2.1 AA.
