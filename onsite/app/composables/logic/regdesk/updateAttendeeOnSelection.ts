import type { TransformedAttendeeInfo } from "@/types/internal/attendee";

export function updateAttendeeOnSelection(
  selectedAttendeeRef: Ref<TransformedAttendeeInfo | null>,
  updateCurrentAttendee: (
    regNumber: number
  ) => Promise<TransformedAttendeeInfo | null>
): void {
  watch(
    () => JSON.stringify(selectedAttendeeRef.value),
    async (value: string, oldValue: string | undefined) => {
      if (value != oldValue && selectedAttendeeRef?.value?.id !== null) {
        await updateCurrentAttendee(selectedAttendeeRef?.value?.id as number);
      }
    },
    { immediate: true }
  );
}
