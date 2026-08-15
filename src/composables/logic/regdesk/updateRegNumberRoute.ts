import { getRegNumberFromRoute } from "@/composables/route/getRegNumberFromRoute";
import { setRegNumberRoute } from "@/composables/route/setRegNumberRoute";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import { watch, type Ref } from "vue";

export function updateRegNumberRoute(
  selectedAttendeeRef: Ref<TransformedAttendeeInfo | null>
) {
  watch(
    () => selectedAttendeeRef.value,
    () => {
      const regNumber = selectedAttendeeRef.value?.id || null;
      // Avoid writing a hash that already matches the route, so selecting
      // an attendee via a hash-driven restore doesn't trigger a redundant
      // hashchange that bounces back into restoreSelectionFromRoute.
      if (getRegNumberFromRoute() === regNumber) {
        return;
      }
      setRegNumberRoute(regNumber);
    }
  );
}
