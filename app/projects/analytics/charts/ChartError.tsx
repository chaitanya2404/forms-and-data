import { AlertTriangle } from "lucide-react";

export function ChartError({
  title,
  message,
  className,
}: {
  title: string;
  message?: string;
  className?: string;
}) {
  return (
    <section
      role="alert"
      className={`rounded-lg border-2 border-red-700 bg-red-50 p-5 ${className ?? ""}`}
    >
      <h3 className="flex items-center gap-2 text-lg font-semibold text-red-800">
        <AlertTriangle className="h-5 w-5" aria-hidden="true" />
        {title} — failed to load
      </h3>
      <p className="mt-2 text-sm text-red-800">
        {message ??
          "We couldn't fetch the data for this chart. The other charts on the page may still be working — try changing the filters or reloading."}
      </p>
    </section>
  );
}
