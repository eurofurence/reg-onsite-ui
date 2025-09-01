import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import { watch, type Ref } from "vue";

export function recordAttendeeSelections(
  selectedAttendeeRef: Ref<TransformedAttendeeInfo | null>,
  previousSelectId: Ref<number | undefined>
): void {
  // Record all selections
  watch(
    () => selectedAttendeeRef.value,
    async (
      value: TransformedAttendeeInfo | null,
      _oldValue: TransformedAttendeeInfo | null | undefined
    ): Promise<void> => {
      if (value?.id !== null && value?.id !== undefined) {
        previousSelectId.value = value.id;
      }
    },
    { immediate: true }
  );
}
