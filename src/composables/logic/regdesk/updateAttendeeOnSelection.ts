import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import { watch, type Ref } from "vue";

export function updateAttendeeOnSelection(
  selectedAttendeeRef: Ref<TransformedAttendeeInfo | null>,
  updateCurrentAttendee: (
    regNumber: RegNumber
  ) => Promise<TransformedAttendeeInfo | null>
): void {
  watch(
    () => JSON.stringify(selectedAttendeeRef.value),
    async (value: string, oldValue: string | undefined) => {
      const regNumber: RegNumber | null | undefined =
        selectedAttendeeRef?.value?.id;
      if (value != oldValue && regNumber !== null && regNumber !== undefined) {
        await updateCurrentAttendee(regNumber);
      }
    },
    { immediate: true }
  );
}
