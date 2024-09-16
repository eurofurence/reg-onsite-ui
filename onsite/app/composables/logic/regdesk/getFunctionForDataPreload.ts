import { Severity, type TransformedAttendeeInfo } from "@/types/internal";
import { attendeeService } from "@/composables/services/attendeeService";
import { getErrorHandlerFunction } from "@/composables/api/base/getErrorHandlerFunction";
import type { ToastServiceMethods } from "primevue/toastservice";

export function getFunctionForDataPreload(
  targetList: Ref<TransformedAttendeeInfo[]>,
  toast: ToastServiceMethods,
  toastGroup: string
): () => Promise<void> {
  return async (): Promise<void> => {
    const result: TransformedAttendeeInfo[] | undefined =
      await attendeeService.getAllAttendees(
        getErrorHandlerFunction(toast, toastGroup)
      );
    if (result !== undefined) {
      targetList.value = result;
      toast.add({
        group: "global",
        severity: Severity.info,
        summary: `Cached ${result.length} attendees`,
        life: 1000,
      });
    }
  };
}
