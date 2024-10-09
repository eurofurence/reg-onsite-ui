import type {
  AllFilterFieldValues,
  RawAttendeeFilter,
} from "@/types/internal/filter";
import { hasFilterContent } from "@/composables/sort_and_filter/hasFilterContent";
import { isValidNameFilter } from "@/composables/sort_and_filter/isValidNameFilter";

export function hasMinimalFilter(filter: RawAttendeeFilter): boolean {
  if (hasFilterContent(filter.badge_id.value)) {
    // Specific badge filters are always sufficient
    return true;
  }
  if (
    hasFilterContent(filter.global.value as string | null) &&
    !isNaN(Number(filter.global.value))
  ) {
    // A raw number in the global field is likely just a badge ID and therefore sufficient
    return true;
  }
  const minFilterFields: AllFilterFieldValues[] = [
    "nickname",
    "first_name",
    "last_name",
    "birthday",
    "global",
  ];
  // At least two characters in any of the specified filters are required to show the results
  for (const minFilterField of minFilterFields) {
    if (isValidNameFilter(<string | null>filter[minFilterField].value)) {
      return true;
    }
  }
  return false;
}
