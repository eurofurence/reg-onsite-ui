import { getAge } from "@/composables/fields/birthday/getAge";
import { isValidAge } from "@/composables/fields/birthday/isValidAge";
import { AttendeeApiStatus } from "@/config/metadata/metadataForStatus";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";

export function canCheckin(attendee: Partial<TransformedAttendeeInfo>) {
  if (attendee?.status !== AttendeeApiStatus.paid) {
    return false;
  }
  if (
    attendee?.current_dues === undefined ||
    attendee?.current_dues === null ||
    attendee.current_dues > 0
  ) {
    return false;
  }
  if (
    attendee?.birthday === undefined ||
    attendee?.birthday === null ||
    !isValidAge(getAge(attendee.birthday))
  ) {
    return false;
  }
  return true;
}
