import {
  AttendeeQueryStrategy,
  type AttendeeDataOptions,
  type TransformedAttendeeInfo,
} from "@/types/internal";
import { hasMinimalFilter } from "@/composables/sort_and_filter/hasMinimalFilter";
import { getFilteredAttendees } from "@/composables/sort_and_filter/getFilteredAttendees";
import { getPlaceholderAttendeeInfo } from "../fields/getPlaceholderAttendeeInfo";

// Prevent focus loss by filling in dummy data
function fillEmptyResult<Type extends TransformedAttendeeInfo>(
  result: Type[]
): Type[] {
  if (result.length === 0) {
    return [
      {
        ...getPlaceholderAttendeeInfo<Type>(),
        ...{ badge_id: "No results!" },
      },
    ];
  }
  return result;
}

export function computedFilteredResult<Type extends TransformedAttendeeInfo>(
  unfilteredList: Ref<Type[]>,
  dataOptionsRef: Ref<AttendeeDataOptions>,
  skipFilterRef: Ref<boolean>
): ComputedRef<Type[]> {
  return computed<Type[]>(() => {
    if (dataOptionsRef.value.queryMode == AttendeeQueryStrategy.manual) {
      return fillEmptyResult(unfilteredList.value);
    } else if (
      skipFilterRef.value ||
      hasMinimalFilter(dataOptionsRef.value.filters)
    ) {
      const result = getFilteredAttendees(
        unfilteredList.value,
        dataOptionsRef.value.filters,
        dataOptionsRef.value.globalFilterFields
      );
      return fillEmptyResult(result);
    }
    return fillEmptyResult([]);
  });
}
