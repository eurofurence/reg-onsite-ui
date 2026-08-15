import { getFilterValue } from "@/composables/sort_and_filter/getFilterValue";

export function hasFilterContent(
  value: string | string[] | null | undefined
): boolean {
  if (value === null || value === undefined) {
    return false;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  if (getFilterValue(value) === "") {
    return false;
  }
  return true;
}
