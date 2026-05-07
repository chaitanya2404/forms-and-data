import * as Progress from "@radix-ui/react-progress";
import { Check } from "lucide-react";
import clsx from "clsx";
import { STEP_LABELS, type StepId } from "../schema";

const STEP_IDS: StepId[] = [1, 2, 3];

export function StepIndicator({ step }: { step: StepId }) {
  const value = (step / STEP_IDS.length) * 100;
  return (
    <nav aria-label="Form progress" className="mt-8">
      <ol className="flex flex-wrap items-center gap-x-6 gap-y-3">
        {STEP_IDS.map((num) => {
          const isCurrent = num === step;
          const isComplete = num < step;
          return (
            <li
              key={num}
              {...(isCurrent ? { "aria-current": "step" as const } : {})}
              className="flex items-center gap-2 text-sm"
            >
              <span
                aria-hidden="true"
                className={clsx(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold",
                  isCurrent && "border-orange-700 bg-orange-700 text-white",
                  isComplete && "border-orange-700 bg-white text-orange-700",
                  !isCurrent &&
                    !isComplete &&
                    "border-gray-300 bg-white text-gray-700",
                )}
              >
                {isComplete ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  num
                )}
              </span>
              <span
                className={clsx(
                  "font-medium",
                  isCurrent || isComplete
                    ? "text-orange-800"
                    : "text-gray-700",
                )}
              >
                <span className="sr-only">
                  {isComplete
                    ? "Completed: "
                    : isCurrent
                      ? "Current step: "
                      : "Upcoming: "}
                </span>
                Step {num} of {STEP_IDS.length}: {STEP_LABELS[num]}
              </span>
            </li>
          );
        })}
      </ol>
      <Progress.Root
        value={value}
        max={100}
        aria-label={`Step ${step} of ${STEP_IDS.length}`}
        className="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-200"
      >
        <Progress.Indicator
          className="h-full bg-orange-700 transition-transform duration-300"
          style={{ transform: `translateX(-${100 - value}%)` }}
        />
      </Progress.Root>
    </nav>
  );
}
