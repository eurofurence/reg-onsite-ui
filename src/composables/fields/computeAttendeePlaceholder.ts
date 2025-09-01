import { deepCopy } from "@/composables/deepCopy";
import { getPlaceholderAttendeeInfo } from "@/composables/fields/getPlaceholderAttendeeInfo";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import { computed, type Ref, type WritableComputedRef } from "vue";

export function computeAttendeePlaceholder(
  attendeeInfoRef: Ref<TransformedAttendeeInfo | null>,
  readOnly = false
): WritableComputedRef<TransformedAttendeeInfo> {
  const computedRef: WritableComputedRef<TransformedAttendeeInfo> = computed({
    get: () => {
      if (attendeeInfoRef.value === null) {
        return getPlaceholderAttendeeInfo();
      } else if (readOnly) {
        return deepCopy(attendeeInfoRef.value);
      } else {
        return attendeeInfoRef.value;
      }
    },
    set: (new_value: TransformedAttendeeInfo) => {
      if (new_value.id !== null && !readOnly) {
        attendeeInfoRef.value = new_value;
      }
    },
  });

  return computedRef;
}
