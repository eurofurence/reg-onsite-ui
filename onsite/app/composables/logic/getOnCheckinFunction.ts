import { getErrorHandlerFunction } from "@/composables/api/base/getErrorHandlerFunction";
import { attendeeService } from "@/composables/services/attendeeService";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type { AttendeeTableDisplayOptions } from "@/types/internal/system/regdesk";
import { ToastSeverity } from "@/types/internal/primevue";
import type { OnsiteToastService } from "@/composables/services/toastService";
import { AttendeeApiStatus } from "@/config/metadata/metadataForStatus";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";

export function getOnCheckinFunction(
  updateAttendee: (
    regNumber: RegNumber
  ) => Promise<TransformedAttendeeInfo | null>,
  selectedAttendeeRef: Ref<TransformedAttendeeInfo | null>,
  displayOptionsRef: Ref<AttendeeTableDisplayOptions> | null,
  toastService: OnsiteToastService
): (regNumber: RegNumber) => Promise<void> {
  return async (regNumber: RegNumber): Promise<void> => {
    await attendeeService.checkinAttendee(
      getErrorHandlerFunction(toastService),
      regNumber
    );
    const updatedAttendee: TransformedAttendeeInfo | null =
      await updateAttendee(regNumber);
    if (updatedAttendee?.status === AttendeeApiStatus.checked_in) {
      toastService.add({
        severity: ToastSeverity.info,
        summary: `Checked in attendee ${regNumber}`,
        life: 2000,
      });
      if (displayOptionsRef && displayOptionsRef.value.checkinAutoClose) {
        setTimeout(() => {
          selectedAttendeeRef.value = null;
        }, 250);
      }
    }
  };
}
