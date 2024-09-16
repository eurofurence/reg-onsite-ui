import { authState } from "@/composables/state/authState";
import { dirtyState } from "@/composables/state/dirtyState";
import type { Reactive } from "vue";

export const debugState: Reactive<{ [key: string]: any }> = reactive({
  authState: authState,
  dirtyState: dirtyState,
});
