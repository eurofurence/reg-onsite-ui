import { hasFilterContent } from "@/composables/sort_and_filter/hasFilterContent";
import type { DataTableFilterMetaData } from "primevue/datatable";
import type { FilterFieldValue, RawAttendeeFilter } from "@/types/internal";
import { FilterMatchMode } from "@primevue/core/api";

export interface EffectiveGlobalFilter {
  globalFilter: DataTableFilterMetaData;
  filterColumns: FilterFieldValue[];
}

export function getEffectiveGlobalFilter(
  filter: RawAttendeeFilter,
  globalFilterColumns: FilterFieldValue[]
): EffectiveGlobalFilter {
  if (!hasFilterContent(filter.global.value)) {
    return { globalFilter: filter.global, filterColumns: [] };
  }
  if (
    globalFilterColumns.includes("badge_id") &&
    !isNaN(Number(filter.global.value))
  ) {
    const newGlobalFilterMeta: DataTableFilterMetaData = {
      ...filter.global,
      ...{ matchMode: FilterMatchMode.EQUALS },
    };
    return { globalFilter: newGlobalFilterMeta, filterColumns: ["badge_id"] };
  }
  return { globalFilter: filter.global, filterColumns: globalFilterColumns };
}
