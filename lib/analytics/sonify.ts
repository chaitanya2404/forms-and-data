// Tiny data-sonification helper used by the line chart.
//
// We map a series of numbers to a sequence of sine-wave tones whose pitch
// scales linearly with value. This is genuinely useful for screen reader
// users — they can hear the shape of a trend without having to walk the
// sr-only table value-by-value — and it costs about 30 lines of code.
//
// The Web Audio API is gated behind a user gesture (the click on the play
// button), which is why we instantiate the AudioContext inside `play()`
// rather than at module load.

export type SonifyOptions = {
  // Total duration of the sequence in milliseconds. Default is 1.8s, which
  // is long enough to hear the shape but short enough not to be tedious.
  totalMs?: number;
  // Pitch range in Hz — defaults to A3 (220) → A5 (880).
  minHz?: number;
  maxHz?: number;
  // Output gain. Sub-1 because oscillator output is loud at unit gain.
  gain?: number;
  // Optional callback when playback finishes (after the last note's stop).
  onEnd?: () => void;
};

export function play(values: readonly number[], opts: SonifyOptions = {}): {
  stop: () => void;
} {
  const totalMs = opts.totalMs ?? 1800;
  const minHz = opts.minHz ?? 220;
  const maxHz = opts.maxHz ?? 880;
  const gainValue = opts.gain ?? 0.07;

  if (values.length === 0) {
    opts.onEnd?.();
    return { stop: () => {} };
  }

  const Ctor =
    typeof window !== "undefined"
      ? (window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext)
      : undefined;
  if (!Ctor) {
    opts.onEnd?.();
    return { stop: () => {} };
  }

  const ctx = new Ctor();
  const gain = ctx.createGain();
  gain.gain.value = gainValue;
  gain.connect(ctx.destination);

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepSeconds = totalMs / values.length / 1000;

  const start = ctx.currentTime + 0.05; // tiny lead so the first tone isn't clipped
  const oscillators: OscillatorNode[] = [];

  values.forEach((v, i) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    const norm = (v - min) / range;
    osc.frequency.value = minHz + norm * (maxHz - minHz);
    osc.connect(gain);
    osc.start(start + i * stepSeconds);
    osc.stop(start + (i + 1) * stepSeconds);
    oscillators.push(osc);
  });

  const lastEnd = start + values.length * stepSeconds;
  const remainingMs = Math.max(0, (lastEnd - ctx.currentTime) * 1000);
  const timeoutId = setTimeout(() => {
    void ctx.close();
    opts.onEnd?.();
  }, remainingMs + 50);

  return {
    stop: () => {
      clearTimeout(timeoutId);
      oscillators.forEach((o) => {
        try {
          o.stop();
        } catch {
          // already stopped
        }
      });
      void ctx.close();
      opts.onEnd?.();
    },
  };
}
