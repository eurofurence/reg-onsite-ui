import { deepCopy } from "@/composables/deepCopy";
import type { AttendeeDataOptions } from "@/types/internal/system/regdesk";
import type { Ref } from "vue";

export function doResetFilters(dataOptionsRef: Ref<AttendeeDataOptions>): void {
  dataOptionsRef.value.filterConfig.filterValues = deepCopy(
    dataOptionsRef.value.filterConfig.presetFilterValues
  );
}
