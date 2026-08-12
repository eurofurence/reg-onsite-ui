import type { AttendeeDataOptions } from "@/types/internal/system/regdesk";
import type { Ref } from "vue";

export function isFilterPristine(
  dataOptionsRef: Ref<AttendeeDataOptions>
): boolean {
  return (
    JSON.stringify(dataOptionsRef.value.filterConfig.presetFilterValues) ===
    JSON.stringify(dataOptionsRef.value.filterConfig.filterValues)
  );
}
