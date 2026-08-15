import type { DurationInMS } from "@/types/internal/common";

export type IntervalId = number & { readonly __brand: "IntervalId" };

export function scheduleRegularTask(
  fun: CallableFunction,
  delay: DurationInMS,
  variance = 0 as DurationInMS
): IntervalId {
  const interval: DurationInMS = (delay +
    Math.floor(Math.random() * variance)) as DurationInMS;
  return setInterval(fun, interval) as unknown as IntervalId;
}
