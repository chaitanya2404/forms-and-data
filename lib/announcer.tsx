"use client";

// Single-channel screen reader announcer.
//
// Multiple aria-live regions on a page compete for screen reader attention
// and produce inconsistent announcements. Instead, mount one `<Announcer />`
// near the root and route all transient SR-only messages through
// `useAnnouncer().announce(message, priority)`.
//
// Two regions are rendered (polite + assertive). The provider toggles which
// one currently holds the message. Empty messages are ignored. To force a
// repeat of an identical message, call `announce` with the same string —
// the provider appends a zero-width space alternation so the live region
// observes a value change.

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

type Priority = "polite" | "assertive";

type AnnouncerContextValue = {
  announce: (message: string, priority?: Priority) => void;
};

const AnnouncerContext = createContext<AnnouncerContextValue | null>(null);

type Options = {
  // Optional debounce window in ms — used by the dashboard to coalesce
  // rapid filter changes into a single announcement.
  debounceMs?: number;
};

export function AnnouncerProvider({
  children,
  debounceMs = 0,
}: {
  children: React.ReactNode;
  debounceMs?: number;
}) {
  const [polite, setPolite] = useState("");
  const [assertive, setAssertive] = useState("");
  const lastPolite = useRef("");
  const lastAssertive = useRef("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const apply = useCallback((message: string, priority: Priority) => {
    // If the same text would be re-announced, alternate a trailing zero-width
    // space so the live region notices the change.
    const pad = (next: string, last: string) =>
      next === last ? `${next}​` : next;
    if (priority === "assertive") {
      const final = pad(message, lastAssertive.current);
      lastAssertive.current = final;
      setAssertive(final);
    } else {
      const final = pad(message, lastPolite.current);
      lastPolite.current = final;
      setPolite(final);
    }
  }, []);

  const announce = useCallback(
    (message: string, priority: Priority = "polite") => {
      if (!message) return;
      if (debounceMs > 0 && priority === "polite") {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => apply(message, priority), debounceMs);
        return;
      }
      apply(message, priority);
    },
    [apply, debounceMs],
  );

  const value = useMemo(() => ({ announce }), [announce]);

  return (
    <AnnouncerContext.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {polite}
      </div>
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {assertive}
      </div>
    </AnnouncerContext.Provider>
  );
}

export function useAnnouncer(): AnnouncerContextValue {
  const ctx = useContext(AnnouncerContext);
  if (!ctx) {
    // Fall back to a no-op so components stay safe in tests / isolated
    // renders that don't mount a provider. This is intentional — we'd rather
    // silently no-op than throw and break the page.
    return { announce: () => {} };
  }
  return ctx;
}
