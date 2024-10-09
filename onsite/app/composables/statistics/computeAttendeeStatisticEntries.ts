import type { TransformedAttendeeInfo } from "@/types/internal/attendee";

export interface AttendeeStatisticEntry extends TransformedAttendeeInfo {}

function getAttendeeStatisticEntry(
  attendee: AttendeeStatisticEntry
): AttendeeStatisticEntry {
  return attendee;
}

export function computeAttendeeStatisticEntries(
  attendeeInfosRef: Ref<AttendeeStatisticEntry[]>
): ComputedRef<AttendeeStatisticEntry[]> {
  return computed<AttendeeStatisticEntry[]>(() => {
    return attendeeInfosRef.value.map(getAttendeeStatisticEntry);
  });
}
