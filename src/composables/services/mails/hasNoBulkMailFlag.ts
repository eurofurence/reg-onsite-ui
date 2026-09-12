import { OtherFlag } from "@/types/external/attsrv/attendees/attendee";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";

export function hasNoBulkMailFlag(
  attendee: TransformedAttendeeInfo
): boolean {
  return (attendee.flags_list ?? []).includes(OtherFlag.nobulkmail);
}

export function isBulkMailRecipient(
  attendee: TransformedAttendeeInfo
): attendee is TransformedAttendeeInfo & { email: string } {
  return Boolean(attendee.email) && !hasNoBulkMailFlag(attendee);
}
