import { deepCopy } from "@/composables/deepCopy";
import { defaultAttendeeDataOptions } from "@/config/system/regdesk";
import type { AttendeeDataOptions } from "@/types/internal/system/regdesk";
import type { Ref } from "vue";

export function doResetFilters(dataOptionsRef: Ref<AttendeeDataOptions>): void {
  dataOptionsRef.value.filterConfig.filterValues = deepCopy(
    defaultAttendeeDataOptions.filterConfig.filterValues
  );
}
