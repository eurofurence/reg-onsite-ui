import { isValidAge } from "@/composables/fields/birthday/isValidAge";
import { Status } from "@/config/setupStatus";
import type { TransformedAttendeeInfo } from "@/types/internal";
import { getAge } from "../birthday/getAge";

export function canCheckin(attendee: Partial<TransformedAttendeeInfo>) {
  if (attendee?.status !== Status.paid) {
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
