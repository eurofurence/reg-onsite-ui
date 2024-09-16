import type { DataTableFilterMetaData } from "primevue/datatable";
import type { TransformedAttendeeInfo } from "@/types/internal";

export function getFilterDecisionForCountry<
  Type extends TransformedAttendeeInfo
>(filterMeta: DataTableFilterMetaData, item: Type) {
  const filterValue: string[] = filterMeta.value || [];
  if (
    filterValue.length === 0 ||
    item.country === null ||
    item.transCountryName === null
  ) {
    return true;
  }
  return (
    filterValue.includes(item.country) ||
    filterValue.includes(item.transCountryName)
  );
}
