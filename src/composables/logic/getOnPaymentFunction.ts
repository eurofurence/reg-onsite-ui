import { getErrorHandlerFunction } from "@/composables/api/base/getErrorHandlerFunction";
import { attendeeService } from "@/composables/services/attendeeService";
import type { OnsiteToastService } from "@/composables/services/toastService";
import { authState } from "@/composables/state/authState";
import { AttendeeApiStatus } from "@/config/metadata/metadataForStatus";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import { ToastSeverity } from "@/types/internal/primevue";

export function getOnPaymentFunction(
  updateAttendee: (
    regNumber: RegNumber
  ) => Promise<TransformedAttendeeInfo | null>,
  toastService: OnsiteToastService
): (regNumber: RegNumber) => Promise<void> {
  return async (regNumber: RegNumber): Promise<void> => {
    console.log("PAYMENT");
    if (authState.value.userRegNumList.includes(regNumber)) {
      toastService.add({
        severity: ToastSeverity.warn,
        summary: `You are trying to pay for yourself! Depending on the backend configuration, this might be prohibited!`,
        life: 10000,
      });
    }
    await attendeeService.putCashPaymentForAttendee(
      getErrorHandlerFunction(toastService),
      regNumber
    );
    const updatedAttendee: TransformedAttendeeInfo | null =
      await updateAttendee(regNumber);
    if (updatedAttendee?.status === AttendeeApiStatus.paid) {
      toastService.add({
        severity: ToastSeverity.info,
        summary: `Payment completed for attendee ${regNumber}`,
        life: 2000,
      });
    }
  };
}
