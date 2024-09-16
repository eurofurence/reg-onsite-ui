import type { DataTableFilterMetaData } from "primevue/datatable";
import type { MatchNumberAgainstValue } from "@/types/internal";

function getSupportedNumberMatchers(): Map<string, MatchNumberAgainstValue> {
  const result: Map<string, MatchNumberAgainstValue> = new Map();
  result.set(
    "equals",
    (dataValue: number, filterValue: number) => dataValue === filterValue
  );
  result.set(
    "startsWith",
    (dataValue: number, filterValue: number) =>
      dataValue == filterValue ||
      dataValue / 10 == filterValue ||
      dataValue / 100 == filterValue ||
      dataValue / 1000 == filterValue ||
      dataValue / 10000 == filterValue
  );
  result.set(
    "endsWith",
    (dataValue: number, filterValue: number) =>
      dataValue == filterValue ||
      dataValue % 10 == filterValue ||
      dataValue % 100 == filterValue ||
      dataValue % 1000 == filterValue ||
      dataValue % 10000 == filterValue
  );
  return result;
}

const supportedMatchers: Map<string, MatchNumberAgainstValue> =
  getSupportedNumberMatchers();

export function getMatcherNumberAgainstValue(
  filter: DataTableFilterMetaData
): MatchNumberAgainstValue {
  const matcher: MatchNumberAgainstValue | undefined = supportedMatchers.get(
    <string>filter.matchMode
  );
  if (matcher === undefined) {
    throw new Error(`Unknown matcher ${filter.matchMode}!`);
  }
  return matcher;
}
