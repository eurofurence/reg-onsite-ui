export function subtractMultiset<T>(from: T[], toSubtract: T[]): T[] {
  const remaining = new Map<T, number>();
  for (const item of toSubtract) {
    remaining.set(item, (remaining.get(item) ?? 0) + 1);
  }
  const result: T[] = [];
  for (const item of from) {
    const remainingCount = remaining.get(item) ?? 0;
    if (remainingCount > 0) {
      remaining.set(item, remainingCount - 1);
    } else {
      result.push(item);
    }
  }
  return result;
}
