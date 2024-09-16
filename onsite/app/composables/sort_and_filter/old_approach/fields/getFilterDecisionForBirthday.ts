import type { DataTableFilterMetaData } from "primevue/datatable";
import { getBirthdayFilterString } from "@/composables/fields/birthday/getBirthdayFilterString";
import { getFilterDecisionForString } from "@/composables/sort_and_filter/old_approach/fields/getFilterDecisionForString";

export function getFilterDecisionForBirthday(
  filterMeta: DataTableFilterMetaData,
  dataFieldValue: string | null
): boolean {
  if (filterMeta.value === null || dataFieldValue === null) {
    return true;
  }
  // Try simple filter
  if (getFilterDecisionForString(filterMeta, dataFieldValue)) {
    return true;
  }
  // Try filter with date parsing
  const birthdayFilter: string | null = getBirthdayFilterString(
    filterMeta.value
  );
  if (birthdayFilter === null) {
    return false;
  }
  const refValue: string = `${dataFieldValue}-`;
  return refValue.startsWith(birthdayFilter);
}
