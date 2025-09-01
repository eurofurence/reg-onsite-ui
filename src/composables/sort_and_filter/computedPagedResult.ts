import { computed, watch, type ComputedRef, type Ref } from "vue";

export function computedPagedResult<Type>(
  sortedListRef: Ref<Type[]>,
  pageStartRef: Ref<number>,
  pageSizeRef: Ref<number>
): ComputedRef<Type[]> {
  function resetPageIfNeeded() {
    // Source is empty => start on first page
    if (sortedListRef.value.length === 0) {
      pageStartRef.value = 0;
    }
    // Page start is beyond length of the source list
    if (pageStartRef.value > sortedListRef.value.length) {
      pageStartRef.value = 0; // Could go to the end
    }
  }
  watch(() => sortedListRef.value.length, resetPageIfNeeded);
  return computed<Type[]>(() => {
    resetPageIfNeeded();
    return sortedListRef.value.slice(
      pageStartRef.value,
      pageStartRef.value + pageSizeRef.value
    );
  });
}
