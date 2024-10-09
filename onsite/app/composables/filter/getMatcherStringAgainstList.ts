import type { DataTableFilterMetaData } from "primevue/datatable";
import type { MatchStringAgainstList } from "@/types/internal/filter";

function getSupportedListMatchers(): Map<string, MatchStringAgainstList> {
  const result: Map<string, MatchStringAgainstList> = new Map();
  result.set("in", (dataValue: string, filterValue: string[]) =>
    filterValue.includes(dataValue)
  );
  return result;
}

const supportedMatchers: Map<string, MatchStringAgainstList> =
  getSupportedListMatchers();

export function getMatcherStringAgainstList(
  filter: DataTableFilterMetaData
): MatchStringAgainstList {
  const matcher: MatchStringAgainstList | undefined = supportedMatchers.get(
    filter.matchMode as string
  );
  if (matcher === undefined) {
    throw new Error(`Unknown matcher ${filter.matchMode}!`);
  }
  return matcher;
}
