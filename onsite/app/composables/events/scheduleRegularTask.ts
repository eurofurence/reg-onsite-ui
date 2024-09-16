export function scheduleRegularTask(
  fun: CallableFunction,
  delay: number,
  variance = 0
): void {
  const interval: number = delay + Math.floor(Math.random() * variance);
  setInterval(fun, interval);
}
