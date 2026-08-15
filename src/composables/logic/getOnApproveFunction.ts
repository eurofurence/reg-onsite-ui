import { getErrorHandlerFunction } from "@/composables/api/base/getErrorHandlerFunction";
import { approveAttendee } from "@/composables/services/attendee/approveAttendee";
import type { OnsiteToastService } from "@/composables/services/toastService";
import { AttendeeApiStatus } from "@/config/metadata/metadataForStatus";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import { ToastSeverity } from "@/types/internal/primevue";

export function getOnApproveFunction(
  updateAttendee: (
    regNumber: RegNumber
  ) => Promise<TransformedAttendeeInfo | null>,
  toastService: OnsiteToastService
): (regNumber: RegNumber) => Promise<void> {
  return async (regNumber: RegNumber): Promise<void> => {
    let approveFailed = false;
    const baseErrorHandler = getErrorHandlerFunction(toastService);
    await approveAttendee(
      (info) => { approveFailed = true; baseErrorHandler(info); },
      regNumber
    );
    if (approveFailed) return;
    const updatedAttendee: TransformedAttendeeInfo | null =
      await updateAttendee(regNumber);
    if (updatedAttendee?.status === AttendeeApiStatus.approved) {
      toastService.add({
        severity: ToastSeverity.info,
        summary: `Attendee ${regNumber} approved`,
        life: 2000,
      });
    } else {
      toastService.add({
        severity: ToastSeverity.warn,
        summary: `Approval for attendee ${regNumber} did not complete as expected`,
        life: 5000,
      });
    }
  };
}
