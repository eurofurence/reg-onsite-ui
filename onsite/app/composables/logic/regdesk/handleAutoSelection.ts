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
  var previousTwinId: [number | null, number | null] | null = null;
  watch(
    () => transformedAttendeeListRef.value,
    async (
      value: TransformedAttendeeInfo[],
      _oldValue: TransformedAttendeeInfo[] | undefined
    ): Promise<void> => {
      if (!displayOptionsRef.value.filterAutoSelect) {
        return;
      }
      if (value.length > 2 || value.length === 0) {
        previousTwinId = null;
        return;
      }
      if (value.length === 2) {
        previousTwinId = [value[0]?.id || null, value[1]?.id || null];
        return;
      }
      if (value.length === 1) {
        const single: TransformedAttendeeInfo = <TransformedAttendeeInfo>(
          value[0]
        );
        if (previousTwinId && previousTwinId.includes(single.id)) {
          // Avoid accidental auto-selection after eg. a checkin has happened (github issue #3)
          return;
        }
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
