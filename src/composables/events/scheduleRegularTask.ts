import type { DurationInMS } from "@/types/internal/common";

export function scheduleRegularTask(
  fun: CallableFunction,
  delay: DurationInMS,
  variance = 0 as DurationInMS
): void {
  const interval: DurationInMS = (delay +
    Math.floor(Math.random() * variance)) as DurationInMS;
  setInterval(fun, interval);
}
