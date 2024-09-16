export function getFilterValue(value: string | null): string | null {
  if (typeof value === "string") {
    return value.trim();
  }
  return value;
}
