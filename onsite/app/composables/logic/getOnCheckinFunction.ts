import type { ToastServiceMethods } from "primevue/toastservice";
import Status from "@/components/field/Status.vue";
import { getErrorHandlerFunction } from "@/composables/api/base/getErrorHandlerFunction";
import { attendeeService } from "@/composables/services/attendeeService";
import {
  Severity,
  type AttendeeTableDisplayOptions,
  type TransformedAttendeeInfo,
} from "@/types/internal";

export function getOnCheckinFunction(
  updateAttendee: (
    regNumber: number
  ) => Promise<TransformedAttendeeInfo | null>,
  toast: ToastServiceMethods,
  toastGroup: string
): (regNumber: number) => Promise<void> {
  return async (regNumber: number): Promise<void> => {
    await attendeeService.checkinAttendee(
      getErrorHandlerFunction(toast, toastGroup),
      regNumber
    );
    const updatedAttendee: TransformedAttendeeInfo | null =
      await updateAttendee(regNumber);
    if (updatedAttendee?.status === Status.checked_in) {
      toast.add({
        group: toastGroup,
        severity: Severity.info,
        summary: `Checked in attendee ${regNumber}`,
        life: 2000,
      });
    }
  };
}
