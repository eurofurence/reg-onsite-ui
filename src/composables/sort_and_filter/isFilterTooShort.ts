import { hasFilterContent } from "@/composables/sort_and_filter/hasFilterContent";
import { isValidNameFilter } from "@/composables/sort_and_filter/isValidNameFilter";

export function isFilterTooShort(value: string | null): boolean {
  return hasFilterContent(value) && !isValidNameFilter(value);
}
