import { dirtyState } from "@/composables/state/dirtyState";

export const isDirty: ComputedRef<boolean> = computed(() => {
  for (const key in dirtyState) {
    if (dirtyState[key] === true) {
      return true;
    }
  }
  return false;
});
