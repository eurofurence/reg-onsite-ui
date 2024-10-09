import { defaultAttendeeDataOptions } from "@/config/system/regdesk";
import type { AttendeeDataOptions } from "@/types/internal/system/regdesk";

const referenceFilterStr: string = JSON.stringify(
  defaultAttendeeDataOptions.filterConfig.filterValues
);

export function isFilterPristine(
  dataOptionsRef: Ref<AttendeeDataOptions>
): boolean {
  return (
    referenceFilterStr ===
    JSON.stringify(dataOptionsRef.value.filterConfig.filterValues)
  );
}
