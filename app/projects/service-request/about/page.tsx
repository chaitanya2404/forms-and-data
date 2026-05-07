import Link from "next/link";
import { ArrowLeft, Check, Minus } from "lucide-react";

export const metadata = {
  title: "Accessibility conformance — Service request form",
};

type Status = "pass" | "n/a";

type Item = {
  sc: string;
  level: "A" | "AA" | "AAA";
  name: string;
  status: Status;
  evidence: string;
};

const ITEMS: Item[] = [
  {
    sc: "1.3.1",
    level: "A",
    name: "Info and Relationships",
    status: "pass",
    evidence:
      "Form structure uses real <label>, <fieldset>, and <legend> elements. Field metadata (required, help, error) is conveyed programmatically via aria-required and aria-describedby — not by visual styling alone.",
  },
  {
    sc: "1.4.3",
    level: "AA",
    name: "Contrast (Minimum)",
    status: "pass",
    evidence:
      "Body text uses gray-900 on white and the primary action uses white on blue-700, both at 4.5:1 or better. Error text uses red-700 on red-50 at 4.5:1 or better. Verified with axe DevTools.",
  },
  {
    sc: "2.1.1",
    level: "A",
    name: "Keyboard",
    status: "pass",
    evidence:
      "All controls — including the custom file input — are reachable and operable with Tab/Shift+Tab/Enter/Space. The hidden file input is sr-only, not display:none, so it remains in the tab order.",
  },
  {
    sc: "2.4.1",
    level: "A",
    name: "Bypass Blocks",
    status: "pass",
    evidence:
      "A skip-to-main-content link is the first focusable element in the layout, becoming visible when focused.",
  },
  {
    sc: "2.4.3",
    level: "A",
    name: "Focus Order",
    status: "pass",
    evidence:
      "Tab order matches visual order. On step transitions, focus is moved programmatically to the new step's heading via useFocusOnMount. On a failed submit, focus is moved to the error summary.",
  },
  {
    sc: "2.4.7",
    level: "AA",
    name: "Focus Visible",
    status: "pass",
    evidence:
      "Global *:focus-visible style in globals.css renders a 2px blue-700 outline with offset on every focusable element.",
  },
  {
    sc: "3.2.2",
    level: "A",
    name: "On Input",
    status: "pass",
    evidence:
      "Selecting a radio or changing a select does not auto-submit or cause unexpected navigation. Step transitions only happen via the explicit Next/Submit/Back buttons.",
  },
  {
    sc: "3.3.1",
    level: "A",
    name: "Error Identification",
    status: "pass",
    evidence:
      "Errors are surfaced inline next to each field, in an error summary at the top with role=alert and aria-live=assertive, and via aria-invalid on each invalid input. Error text is text — not color or icon alone.",
  },
  {
    sc: "3.3.2",
    level: "A",
    name: "Labels or Instructions",
    status: "pass",
    evidence:
      "Every input has a real, visible <label> (placeholders are never used as labels). Required fields use aria-required=true plus an asterisk indicator. Help text is connected via aria-describedby.",
  },
  {
    sc: "3.3.3",
    level: "AA",
    name: "Error Suggestion",
    status: "pass",
    evidence:
      "Error messages are field-specific and suggest a fix (e.g. \"Subject must be at least 3 characters\" rather than \"invalid input\"). Copy lives in lib/errors.ts and follows documented rules: be specific, suggest a fix, don't blame the user.",
  },
  {
    sc: "3.3.4",
    level: "AA",
    name: "Error Prevention (Legal, Financial, Data)",
    status: "n/a",
    evidence:
      "This form has no legal, financial, or data-modifying consequences — submitted requests are mock and not persisted. The review step (step 3) does, however, present a reversible summary before submission, which would satisfy this SC if it applied.",
  },
  {
    sc: "4.1.2",
    level: "A",
    name: "Name, Role, Value",
    status: "pass",
    evidence:
      "Native form controls expose their name/role/value to assistive tech without intervention. Radio groups use <fieldset>/<legend>. The custom file-input wrapper is a real <input type=\"file\"> with a wrapping <label>.",
  },
  {
    sc: "4.1.3",
    level: "AA",
    name: "Status Messages",
    status: "pass",
    evidence:
      "Status changes — step transitions, file-selection confirmation, optimistic submission — are announced through a single Announcer provider with an aria-live=polite region and an aria-live=assertive region. The error summary uses role=alert.",
  },
];

export default function AboutPage() {
  const passes = ITEMS.filter((i) => i.status === "pass").length;
  const total = ITEMS.length;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Link
        href="/projects/service-request"
        className="inline-flex items-center gap-1 text-sm font-medium text-blue-800 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to the form
      </Link>

      <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
        Accessibility conformance report
      </h1>
      <p className="mt-3 max-w-2xl text-gray-700">
        How the service request form maps against WCAG 2.1 success criteria.
        This is the deliverable enterprise procurement teams typically request
        when evaluating an accessibility claim. Verified manually with NVDA on
        Firefox and axe DevTools.
      </p>
      <p className="mt-2 text-sm text-gray-600">
        Conformance summary: <strong>{passes}</strong> of {total} listed
        criteria satisfied. Items marked N/A do not apply to this form and
        the reason is given.
      </p>

      <table className="mt-8 w-full border-collapse text-left text-sm">
        <caption className="sr-only">
          WCAG 2.1 success criteria mapping for the service request form
        </caption>
        <thead>
          <tr className="border-b-2 border-gray-300">
            <th scope="col" className="py-2 pr-4 font-semibold text-gray-900">
              SC
            </th>
            <th scope="col" className="py-2 pr-4 font-semibold text-gray-900">
              Level
            </th>
            <th scope="col" className="py-2 pr-4 font-semibold text-gray-900">
              Criterion
            </th>
            <th scope="col" className="py-2 pr-4 font-semibold text-gray-900">
              Status
            </th>
            <th scope="col" className="py-2 font-semibold text-gray-900">
              Evidence
            </th>
          </tr>
        </thead>
        <tbody>
          {ITEMS.map((item) => (
            <tr
              key={item.sc}
              className="border-b border-gray-200 align-top"
            >
              <td className="py-3 pr-4 font-mono text-gray-900">{item.sc}</td>
              <td className="py-3 pr-4 text-gray-900">{item.level}</td>
              <td className="py-3 pr-4 text-gray-900">{item.name}</td>
              <td className="py-3 pr-4">
                {item.status === "pass" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                    <Check className="h-3 w-3" aria-hidden="true" />
                    Pass
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
                    <Minus className="h-3 w-3" aria-hidden="true" />
                    N/A
                  </span>
                )}
              </td>
              <td className="py-3 text-gray-700">{item.evidence}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="mt-12 text-xl font-semibold text-gray-900">
        What is intentionally <em>not</em> claimed
      </h2>
      <ul className="mt-3 list-disc space-y-2 pl-6 text-gray-700">
        <li>
          <strong>1.4.10 Reflow.</strong> The form has been spot-checked at
          400% zoom and 320 CSS pixels but has not been formally tested
          across all viewport breakpoints with assistive tech.
        </li>
        <li>
          <strong>1.4.13 Content on Hover or Focus.</strong> No content is
          revealed on hover or focus, so this SC doesn&apos;t apply — but it
          would be re-verified if tooltips were added.
        </li>
        <li>
          <strong>2.1.4 Character Key Shortcuts.</strong> The form does not
          implement custom single-character shortcuts.
        </li>
        <li>
          <strong>Cognitive accessibility (WCAG 2.2 / Cognitive
          guidance).</strong> Error messages aim to suggest fixes, but no
          formal cognitive accessibility audit has been performed.
        </li>
      </ul>

      <h2 className="mt-12 text-xl font-semibold text-gray-900">
        Testing tools
      </h2>
      <ul className="mt-3 list-disc space-y-1 pl-6 text-gray-700">
        <li>NVDA + Firefox on Windows for screen reader testing</li>
        <li>axe DevTools for automated WCAG 2.1 AA scanning</li>
        <li>Manual keyboard-only testing across all flows</li>
        <li>Lighthouse Accessibility (target ≥ 95)</li>
      </ul>
    </div>
  );
}
