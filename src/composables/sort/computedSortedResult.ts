import { sortAttendees } from "@/composables/sort/sortAttendees";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type { AttendeeDataOptions } from "@/types/internal/system/regdesk";
import { computed, watchEffect, type ComputedRef, type Ref } from "vue";

export function computedSortedResult<Type extends TransformedAttendeeInfo>(
  unsortedList: Ref<Type[]>,
  dataOptionsRef: Ref<AttendeeDataOptions>
): ComputedRef<Type[]> {
  const sorted = computed<Type[]>(() =>
    sortAttendees<Type>(unsortedList.value, dataOptionsRef.value.sortOrder)
  );

  watchEffect(() => {
    const result = sorted.value;
    dataOptionsRef.value.totalRecords =
      result.length === 1 && result[0]?.id === null ? 0 : result.length;
  }, { flush: 'sync' });

  return sorted;
}
