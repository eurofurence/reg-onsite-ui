import { hasMinimalFilter } from "@/composables/sort_and_filter/hasMinimalFilter";
import { getFilteredAttendees } from "@/composables/sort_and_filter/getFilteredAttendees";
import { getPlaceholderAttendeeInfo } from "@/composables/fields/getPlaceholderAttendeeInfo";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import {
  AttendeeQueryStrategy,
  type AttendeeDataOptions,
} from "@/types/internal/system/regdesk";

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
      hasMinimalFilter(dataOptionsRef.value.filterConfig.filterValues)
    ) {
      const result = getFilteredAttendees(
        unfilteredList.value,
        dataOptionsRef.value.filterConfig.filterValues,
        dataOptionsRef.value.filterConfig.globalFilterFields
      );
      return fillEmptyResult(result);
    }
    return fillEmptyResult([]);
  });
}
