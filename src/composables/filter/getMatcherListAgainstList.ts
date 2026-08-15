import type { MatchListAgainstList } from "@/types/internal/filter";
import type { DataTableFilterMetaData } from "primevue/datatable";

export const IN_OR_EMPTY_MATCH_MODE = "in-or-empty";
// Sentinel filter value representing "no entries recorded" for fields
// using IN_OR_EMPTY_MATCH_MODE — never a real data value.
export const EMPTY_LIST_SENTINEL = "__empty__";

function getSupportedListMatchers(): Map<string, MatchListAgainstList> {
  const result: Map<string, MatchListAgainstList> = new Map();
  result.set("in", (dataValue: string[], filterValue: string[]) =>
    dataValue.some((entry: string) => filterValue.includes(entry))
  );
  // Same as "in", but the EMPTY_LIST_SENTINEL filter value also matches
  // attendees whose dataValue list is empty ("nothing recorded").
  result.set(
    IN_OR_EMPTY_MATCH_MODE,
    (dataValue: string[], filterValue: string[]) =>
      (dataValue.length === 0 && filterValue.includes(EMPTY_LIST_SENTINEL)) ||
      dataValue.some((entry: string) => filterValue.includes(entry))
  );
  return result;
}

const supportedMatchers: Map<string, MatchListAgainstList> =
  getSupportedListMatchers();

export function getMatcherListAgainstList(
  filter: DataTableFilterMetaData
): MatchListAgainstList {
  const matcher: MatchListAgainstList | undefined = supportedMatchers.get(
    filter.matchMode as string
  );
  if (matcher === undefined) {
    throw new Error(`Unknown matcher ${filter.matchMode}!`);
  }
  return matcher;
}
