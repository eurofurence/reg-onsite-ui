import type { MatchNumberAgainstValue } from "@/types/internal/filter";
import type { DataTableFilterMetaData } from "primevue/datatable";

function getSupportedNumberMatchers(): Map<string, MatchNumberAgainstValue> {
  const result: Map<string, MatchNumberAgainstValue> = new Map();
  result.set(
    "equals",
    (dataValue: number, filterValue: string) =>
      dataValue === Number(filterValue)
  );
  result.set("startsWith", (dataValue: number, filterValue: string) =>
    String(dataValue).startsWith(filterValue)
  );
  result.set("endsWith", (dataValue: number, filterValue: string) =>
    String(dataValue).endsWith(filterValue)
  );
  return result;
}

const supportedMatchers: Map<string, MatchNumberAgainstValue> =
  getSupportedNumberMatchers();

export function getMatcherNumberAgainstValue(
  filter: DataTableFilterMetaData
): MatchNumberAgainstValue {
  const matcher: MatchNumberAgainstValue | undefined = supportedMatchers.get(
    filter.matchMode as string
  );
  if (matcher === undefined) {
    throw new Error(`Unknown matcher ${filter.matchMode}!`);
  }
  return matcher;
}
