import { getFilterValue } from "@/composables/sort_and_filter/getFilterValue";

export function hasFilterContent(value: string | null): boolean {
  if (value === null) {
    return false;
  }
  if (getFilterValue(value) === "") {
    return false;
  }
  return true;
}
