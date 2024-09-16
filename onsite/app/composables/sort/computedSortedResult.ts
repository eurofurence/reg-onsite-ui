import type {
  AttendeeDataOptions,
  TransformedAttendeeInfo,
} from "@/types/internal";
import { sortAttendees } from "@/composables/sort/sortAttendees";

export function computedSortedResult<Type extends TransformedAttendeeInfo>(
  unsortedList: Ref<Type[]>,
  dataOptionsRef: Ref<AttendeeDataOptions>
): ComputedRef<Type[]> {
  return computed<Type[]>(() => {
    const result: Type[] = sortAttendees<Type>(
      unsortedList.value,
      dataOptionsRef.value.sortOrder
    );
    if (result.length !== 1) {
      dataOptionsRef.value.totalRecords = result.length;
    } else if (result[0]?.id === null) {
      dataOptionsRef.value.totalRecords = 0;
    } else {
      dataOptionsRef.value.totalRecords = result.length;
    }
    return result;
  });
}
