import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type { AttendeeTableDisplayOptions } from "@/types/internal/system/regdesk";
import { ref, watch, type Ref } from "vue";

const previousAutoSelectId: Ref<number | undefined> = ref(undefined);
let previousTwinId: [number | null, number | null] | null = null;

function performAutoSelection(
  transformedAttendeeInfoList: TransformedAttendeeInfo[],
  selectedAttendeeRef: Ref<TransformedAttendeeInfo | null>,
  previousSelectId: Ref<number | undefined>
) {
  if (
    transformedAttendeeInfoList.length > 2 ||
    transformedAttendeeInfoList.length === 0
  ) {
    previousTwinId = null;
    return;
  }
  if (transformedAttendeeInfoList.length === 2) {
    previousTwinId = [
      transformedAttendeeInfoList[0]?.id || null,
      transformedAttendeeInfoList[1]?.id || null,
    ];
    return;
  }
  if (transformedAttendeeInfoList.length === 1) {
    const single: TransformedAttendeeInfo =
      transformedAttendeeInfoList[0] as TransformedAttendeeInfo;
    if (
      previousAutoSelectId.value !== undefined &&
      previousTwinId &&
      previousTwinId.includes(previousAutoSelectId.value)
    ) {
      // Avoid accidental auto-selection after eg. a checkin has happened (github issue #3)
      return;
    }
    if (
      single.id !== null &&
      single.id !== previousAutoSelectId.value &&
      single.id !== previousSelectId.value
    ) {
      previousAutoSelectId.value = single.id;
      selectedAttendeeRef.value =
        transformedAttendeeInfoList[0] as TransformedAttendeeInfo;
    }
  }
}

export function handleAutoSelection(
  transformedAttendeeListRef: Ref<TransformedAttendeeInfo[]>,
  selectedAttendeeRef: Ref<TransformedAttendeeInfo | null>,
  displayOptionsRef: Ref<AttendeeTableDisplayOptions>,
  previousSelectId: Ref<number | undefined>
): void {
  // Handle autoselect
  watch(
    () => transformedAttendeeListRef.value,
    async (
      value: TransformedAttendeeInfo[],
      _oldValue: TransformedAttendeeInfo[] | undefined
    ): Promise<void> => {
      if (displayOptionsRef.value.filterAutoSelect) {
        performAutoSelection(value, selectedAttendeeRef, previousSelectId);
      }
    },
    { immediate: true }
  );
}
