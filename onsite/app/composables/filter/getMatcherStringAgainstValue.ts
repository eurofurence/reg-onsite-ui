import type { DataTableFilterMetaData } from "primevue/datatable";
import type { MatchStringAgainstValue } from "@/types/internal/filter";

function getSupportedStringMatchers(): Map<string, MatchStringAgainstValue> {
  const result: Map<string, MatchStringAgainstValue> = new Map();
  result.set(
    "equals",
    (dataValue: string, filterValue: string) => dataValue === filterValue
  );
  result.set("contains", (dataValue: string, filterValue: string) =>
    dataValue.includes(filterValue)
  );
  result.set("startsWith", (dataValue: string, filterValue: string) =>
    dataValue.startsWith(filterValue)
  );
  result.set("endsWith", (dataValue: string, filterValue: string) =>
    dataValue.endsWith(filterValue)
  );
  return result;
}

const supportedMatchers: Map<string, MatchStringAgainstValue> =
  getSupportedStringMatchers();

export function getMatcherStringAgainstValue(
  filter: DataTableFilterMetaData
): MatchStringAgainstValue {
  const matcher: MatchStringAgainstValue | undefined = supportedMatchers.get(
    filter.matchMode as string
  );
  if (matcher === undefined) {
    throw new Error(`Unknown matcher ${filter.matchMode}!`);
  }
  return matcher;
}
