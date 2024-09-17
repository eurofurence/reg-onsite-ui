import { defaultAttendeeDataOptions } from "@/config/regdesk";
import type { AttendeeDataOptions } from "@/types/internal";
import { deepCopy } from "@/composables/state/deepCopy";
import { filterComponentRegistry } from "@/composables/state/filterComponentRegistry";

export function doResetFilters(dataOptionsRef: Ref<AttendeeDataOptions>): void {
  dataOptionsRef.value.filters = deepCopy(defaultAttendeeDataOptions.filters);
  filterComponentRegistry.callAllResets();
}
