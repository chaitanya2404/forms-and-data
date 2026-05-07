// Owns the rendering of a single field's error message and the id
// conventions everyone wires `aria-describedby` against.
//
// IDs: `${field}-help` for help text, `${field}-error` for the error message.

export function helpId(field: string): string {
  return `${field}-help`;
}

export function errorId(field: string): string {
  return `${field}-error`;
}

export function describedBy(
  field: string,
  opts: { hasHelp?: boolean; hasError?: boolean },
): string | undefined {
  const ids: string[] = [];
  if (opts.hasHelp) ids.push(helpId(field));
  if (opts.hasError) ids.push(errorId(field));
  return ids.length > 0 ? ids.join(" ") : undefined;
}

export function FieldError({
  field,
  message,
}: {
  field: string;
  message: string | undefined;
}) {
  if (!message) return null;
  return (
    <p
      id={errorId(field)}
      className="mt-1 text-sm font-medium text-red-700"
    >
      {message}
    </p>
  );
}
