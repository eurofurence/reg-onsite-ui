import { dirtyState } from "@/composables/state/dirtyState";
import { computed, unref, type ComputedRef } from "vue";

export const isDirty: ComputedRef<boolean> = computed(() => {
  for (const key in dirtyState) {
    if (unref(dirtyState[key]) === true) {
      return true;
    }
  }
  return false;
});
