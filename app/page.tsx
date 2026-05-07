import Link from "next/link";

const projects = [
  {
    n: "01",
    id: "service-request",
    title: "Service Request Form",
    kind: "Form / state machine",
    blurb:
      "Three-step form modelled as an explicit state machine, submitting via Server Actions with cookie-backed state — works without JavaScript. Draft save, optimistic UI, accessible custom file input, and a WCAG 2.1 conformance report.",
    stack: ["Next.js", "Server Actions", "Reducer"],
    href: "/projects/service-request",
  },
  {
    n: "02",
    id: "analytics",
    title: "Analytics Dashboard",
    kind: "Data viz / streaming",
    blurb:
      "URL-driven filter state, streaming Suspense per chart, and three-layer chart accessibility — including a sonification button that plays the line trend as ascending or descending tones for screen-reader users.",
    stack: ["Next.js", "Recharts", "Web Audio"],
    href: "/projects/analytics",
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-6 lg:px-16">
      <Hero />
      <Projects />
    </div>
  );
}

function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative border-b border-rule pt-24 pb-20"
    >
      <div className="mb-10 flex items-center gap-4 text-[11px] uppercase tracking-[0.08em] text-ink3">
        <span className="inline-flex items-center gap-2">
          <span
            aria-hidden="true"
            className="h-[7px] w-[7px] rounded-full bg-emerald-700 shadow-[0_0_0_3px_rgba(21,128,61,0.16)]"
            style={{ animation: "pulse-dot 2s ease-in-out infinite" }}
          />
          two projects · accessible by default
        </span>
        <span className="h-px flex-1 bg-rule" />
      </div>

      <div className="grid items-end gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(220px,280px)]">
        <h1
          id="hero-heading"
          className="m-0 font-mono text-[clamp(56px,9vw,112px)] font-semibold leading-[0.96] tracking-[-0.04em] text-ink text-balance"
        >
          Forms <br />
          and <span className="text-accent">data.</span>
        </h1>

        <div className="flex flex-col gap-2.5">
          <div className="border border-rule bg-paper2 px-4 py-3.5">
            <div className="mb-1.5 text-[10px] uppercase tracking-[0.1em] text-ink3">
              projects
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold leading-none tracking-[-0.03em] text-ink">
                02
              </span>
              <span className="text-xs text-ink2">live demos</span>
            </div>
          </div>
          <div className="grid grid-cols-[auto_1fr] gap-x-3.5 gap-y-1.5 border border-rule px-3.5 py-3 text-[11px] text-ink2">
            <span className="text-ink3">stack</span>
            <span className="text-ink">Next.js · TypeScript</span>
            <span className="text-ink3">a11y</span>
            <span className="text-ink">WCAG 2.1 AA</span>
            <span className="text-ink3">tested</span>
            <span className="text-ink">NVDA · axe · keyboard</span>
            <span className="text-ink3">parent</span>
            <span className="text-ink">accessibility-portfolio</span>
          </div>
        </div>
      </div>

      <p className="mt-12 max-w-[34ch] text-lg leading-snug text-ink text-pretty">
        The two parts of web apps users most struggle with — long forms and
        dense dashboards — built as if the screen reader user was the first
        user.
      </p>

      <div className="mt-10 flex flex-wrap items-center gap-3 text-[13px]">
        <Link
          href="/projects/service-request"
          className="inline-flex items-center gap-2 border border-accent bg-accent px-[18px] py-[11px] font-medium text-accent-ink transition-colors hover:bg-ink hover:text-paper"
        >
          view projects →
        </Link>
        <a
          href="https://accessibility-portfolio.vercel.app"
          className="inline-flex items-center gap-2 border border-rule px-[18px] py-[11px] text-ink transition-colors hover:bg-paper2"
        >
          back to portfolio
        </a>
        <a
          href="https://github.com/chaitanya2404/forms-and-data"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 border border-rule px-[18px] py-[11px] text-ink transition-colors hover:bg-paper2"
        >
          source on GitHub ↗
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </section>
  );
}

function Projects() {
  return (
    <section
      aria-labelledby="projects-heading"
      className="border-b border-rule py-24"
    >
      <div className="mb-10 flex items-baseline gap-4">
        <span className="text-[11px] tracking-[0.1em] text-accent">§ 01</span>
        <h2
          id="projects-heading"
          className="m-0 text-[clamp(28px,3.5vw,40px)] font-semibold tracking-[-0.02em] text-ink"
        >
          Projects
        </h2>
        <span className="text-[13px] text-ink3">
          {projects.length} live · open to interact directly
        </span>
      </div>

      <ul className="grid gap-6 md:grid-cols-2">
        {projects.map((p) => (
          <li
            key={p.id}
            className="flex flex-col border border-rule bg-paper2 transition-[border-color,transform] hover:-translate-y-1 hover:border-accent"
          >
            <div className="border-b border-rule bg-paper p-5">
              <div className="text-[11px] uppercase tracking-[0.08em] text-ink3">
                {p.n} · {p.kind}
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-3.5 p-5 lg:p-6">
              <h3 className="m-0 text-[22px] font-semibold tracking-[-0.01em] text-ink">
                <Link
                  href={p.href}
                  className="text-ink hover:text-accent focus-visible:text-accent"
                  aria-label={`Open the ${p.title} project`}
                >
                  {p.title}
                </Link>
              </h3>
              <p className="m-0 flex-1 text-[13px] leading-[1.55] text-ink2 text-pretty">
                {p.blurb}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {p.stack.map((s) => (
                  <span
                    key={s}
                    className="border border-rule px-1.5 py-0.5 text-[11px] text-ink2"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <div className="mt-1 flex items-center justify-between">
                <Link
                  href={p.href}
                  className="text-[12px] font-medium text-accent hover:text-ink focus-visible:text-ink"
                  aria-label={`Open the ${p.title} project`}
                >
                  view live →
                </Link>
                <span className="text-[11px] text-ink3">{p.id}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
