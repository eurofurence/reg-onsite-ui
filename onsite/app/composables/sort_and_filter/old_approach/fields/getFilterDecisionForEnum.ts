import type { DataTableFilterMetaData } from "primevue/datatable";

export function getFilterDecisionForEnum<EnumValuesType>(
  filterMeta: DataTableFilterMetaData,
  dataFieldValue: EnumValuesType | null
): boolean {
  const filterValue: EnumValuesType[] = filterMeta.value || [];
  if (filterValue.length === 0 || dataFieldValue === null) {
    return true; // handle empty filter
  } else {
    return filterValue.includes(dataFieldValue);
  }
}
