export interface BadgePrintHistoryEntry {
  by: string;
  when: string;
  badgeTypeId: string;
  badgeTypeName: string;
  fieldValues: Record<string, string>;
}

export function parseBadgePrintHistoryEntry(
  raw: string
): BadgePrintHistoryEntry | null {
  try {
    return JSON.parse(raw) as BadgePrintHistoryEntry;
  } catch {
    return null;
  }
}
