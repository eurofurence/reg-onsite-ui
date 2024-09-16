import type { TransformedAttendeeInfo } from "@/types/internal";

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
        await updateCurrentAttendee(<number>selectedAttendeeRef?.value?.id);
      }
    },
    { immediate: true }
  );
}
