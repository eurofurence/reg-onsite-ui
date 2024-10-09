import { attendeeService } from "@/composables/services/attendeeService";
import { getErrorHandlerFunction } from "@/composables/api/base/getErrorHandlerFunction";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import { ToastSeverity } from "@/types/internal/primevue";
import type { OnsiteToastService } from "@/composables/services/toastService";

export function getFunctionForDataPreload(
  targetList: Ref<TransformedAttendeeInfo[]>,
  toastService: OnsiteToastService
): () => Promise<void> {
  return async (): Promise<void> => {
    const result: TransformedAttendeeInfo[] | undefined =
      await attendeeService.getAllAttendees(
        getErrorHandlerFunction(toastService)
      );
    if (result !== undefined) {
      targetList.value = result;
      toastService.add({
        severity: ToastSeverity.info,
        summary: `Cached ${result.length} attendees`,
        life: 1000,
      });
    }
  };
}
