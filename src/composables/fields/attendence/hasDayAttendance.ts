import { getDayAttendanceValues } from "@/composables/fields/packages/getValues";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";

export function hasDayAttendance(attendee: TransformedAttendeeInfo): boolean {
  return getDayAttendanceValues(attendee.packages_list || []).length > 0;
}
