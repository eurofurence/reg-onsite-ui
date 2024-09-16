import type { DataTableFilterMetaData } from "primevue/datatable";

export function getFilterDecisionForString(
  filterMeta: DataTableFilterMetaData,
  dataFieldValue: string | null
) {
  if (dataFieldValue === null || filterMeta.value === null) {
    return true;
  }
  var fieldValue: string = dataFieldValue.trim();
  if (filterMeta.matchMode === "startsWith") {
    return fieldValue.startsWith(filterMeta.value);
  } else if (filterMeta.matchMode === "endsWith") {
    return fieldValue.endsWith(filterMeta.value);
  } else if (filterMeta.matchMode === "equals") {
    return fieldValue === filterMeta.value;
  } else if (filterMeta.matchMode === "notEquals") {
    return fieldValue !== filterMeta.value;
  } else if (filterMeta.matchMode === "contains") {
    return fieldValue.includes(filterMeta.value);
  } else if (filterMeta.matchMode === "notContains") {
    return !fieldValue.includes(filterMeta.value);
  }
  return false;
}
