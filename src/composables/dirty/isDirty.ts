import { dirtyState } from "@/composables/state/dirtyState";
import { computed, type ComputedRef } from "vue";

export const isDirty: ComputedRef<boolean> = computed(() => {
  for (const key in dirtyState) {
    if (dirtyState[key] === true) {
      return true;
    }
  }
  return false;
});
