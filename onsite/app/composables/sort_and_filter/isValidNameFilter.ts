import { hasFilterContent } from "@/composables/sort_and_filter/hasFilterContent";

export function isValidNameFilter(value: string | null): boolean {
  if (!hasFilterContent(value)) {
    return false;
  }
  return (<string>value).length >= 2;
}
