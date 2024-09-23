import { defaultAttendeeDataOptions } from "@/config/app/regdesk";
import type { AttendeeDataOptions } from "@/types/internal";

const referenceFilterStr: string = JSON.stringify(
  defaultAttendeeDataOptions.filters
);

export function isFilterPristine(
  dataOptionsRef: Ref<AttendeeDataOptions>
): boolean {
  return referenceFilterStr === JSON.stringify(dataOptionsRef.value.filters);
}
