export function debounceLeading<T extends (...args: any[]) => any>(
  fn: T,
  delayMs = 300
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  let blocked = false;
  return (...args: Parameters<T>): ReturnType<T> | undefined => {
    if (blocked) return undefined;
    blocked = true;
    setTimeout(() => {
      blocked = false;
    }, delayMs);
    return fn(...args);
  };
}
