import { defaultAttendeeDataOptions } from "@/config/system/regdesk";
import { deepCopy } from "@/composables/deepCopy";
import type { AttendeeDataOptions } from "@/types/internal/system/regdesk";

export function doResetFilters(dataOptionsRef: Ref<AttendeeDataOptions>): void {
  dataOptionsRef.value.filterConfig.filterValues = deepCopy(
    defaultAttendeeDataOptions.filterConfig.filterValues
  );
}
