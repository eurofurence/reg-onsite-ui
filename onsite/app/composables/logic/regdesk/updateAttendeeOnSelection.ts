import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";

export function updateAttendeeOnSelection(
  selectedAttendeeRef: Ref<TransformedAttendeeInfo | null>,
  updateCurrentAttendee: (
    regNumber: RegNumber
  ) => Promise<TransformedAttendeeInfo | null>
): void {
  watch(
    () => JSON.stringify(selectedAttendeeRef.value),
    async (value: string, oldValue: string | undefined) => {
      if (value != oldValue && selectedAttendeeRef?.value?.id !== null) {
        await updateCurrentAttendee(
          selectedAttendeeRef?.value?.id as RegNumber
        );
      }
    },
    { immediate: true }
  );
}
