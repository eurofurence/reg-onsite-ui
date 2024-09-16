import type {
  AttendeeTableDisplayOptions,
  TransformedAttendeeInfo,
} from "@/types/internal";

export function handleAutoSelection(
  transformedAttendeeListRef: Ref<TransformedAttendeeInfo[]>,
  selectedAttendeeRef: Ref<TransformedAttendeeInfo | null>,
  displayOptionsRef: Ref<AttendeeTableDisplayOptions>,
  previousSelectId: Ref<number | undefined>
): void {
  // Handle autoselect
  const previousAutoSelectId: Ref<number | undefined> = ref(undefined);
  watch(
    () => transformedAttendeeListRef.value,
    async (
      value: TransformedAttendeeInfo[],
      _oldValue: TransformedAttendeeInfo[] | undefined
    ): Promise<void> => {
      if (displayOptionsRef.value.filterAutoSelect && value.length === 1) {
        const single: TransformedAttendeeInfo = <TransformedAttendeeInfo>(
          value[0]
        );
        if (
          single.id !== null &&
          single.id !== previousAutoSelectId.value &&
          single.id !== previousSelectId.value
        ) {
          previousAutoSelectId.value = single.id;
          selectedAttendeeRef.value = <TransformedAttendeeInfo>value[0];
        }
      }
    },
    { immediate: true }
  );
}
