export function generateId(baseId: string | undefined): string {
  return baseId || Math.random().toString();
}
