// Loading skeleton shown by the Suspense boundary while a chart's data
// streams in from the server.

export function ChartSkeleton({
  title,
  className,
}: {
  title: string;
  className?: string;
}) {
  return (
    <section
      aria-busy="true"
      aria-live="polite"
      className={`rounded-lg border border-gray-200 bg-white p-5 shadow-sm ${className ?? ""}`}
    >
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="sr-only">Loading {title.toLowerCase()}…</p>
      <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-gray-200" />
      <div className="mt-4 h-72 w-full animate-pulse rounded bg-gray-100" />
    </section>
  );
}
