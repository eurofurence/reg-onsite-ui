import { setRegNumberRoute } from "@/composables/route/setRegNumberRoute";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import { watch, type Ref } from "vue";

export function updateRegNumberRoute(
  selectedAttendeeRef: Ref<TransformedAttendeeInfo | null>
) {
  watch(
    () => selectedAttendeeRef.value,
    () => {
      setRegNumberRoute(selectedAttendeeRef.value?.id || null);
    }
  );
}
