import { defaultAttendeeDataOptions } from "@/config/regdesk";
import type { AttendeeDataOptions } from "@/types/internal";
import { deepCopy } from "@/composables/state/deepCopy";

export function doResetFilters(dataOptionsRef: Ref<AttendeeDataOptions>): void {
  dataOptionsRef.value.filters = deepCopy(defaultAttendeeDataOptions.filters);
}
