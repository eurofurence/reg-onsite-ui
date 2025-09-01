import { getPlaceholderAttendeeInfo } from "@/composables/fields/getPlaceholderAttendeeInfo";
import { getFilteredAttendees } from "@/composables/sort_and_filter/getFilteredAttendees";
import { hasMinimalFilter } from "@/composables/sort_and_filter/hasMinimalFilter";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import {
  AttendeeQueryStrategy,
  type AttendeeDataOptions,
} from "@/types/internal/system/regdesk";
import { computed, type ComputedRef, type Ref } from "vue";

// Prevent focus loss by filling in dummy data
function fillEmptyResult<Type extends TransformedAttendeeInfo>(
  result: Type[],
  message: string
): Type[] {
  if (result.length === 0) {
    return [
      {
        ...getPlaceholderAttendeeInfo<Type>(),
        ...{ badge_id: message },
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
      return fillEmptyResult(unfilteredList.value, "No filter results");
    } else if (
      skipFilterRef.value ||
      hasMinimalFilter(dataOptionsRef.value.filterConfig.filterValues)
    ) {
      const result = getFilteredAttendees(
        unfilteredList.value,
        dataOptionsRef.value.filterConfig.filterValues,
        dataOptionsRef.value.filterConfig.globalFilterFields
      );
      if (unfilteredList.value.length > 0) {
        return fillEmptyResult(result, "No filtered results");
      } else {
        return fillEmptyResult(result, "No data");
      }
    }
    return fillEmptyResult([], "Please add filter criteria");
  });
}
