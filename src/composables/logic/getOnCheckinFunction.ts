import { getErrorHandlerFunction } from "@/composables/api/base/getErrorHandlerFunction";
import { attendeeService } from "@/composables/services/attendeeService";
import type { OnsiteToastService } from "@/composables/services/toastService";
import { authState } from "@/composables/state/authState";
import { AttendeeApiStatus } from "@/config/metadata/metadataForStatus";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import { ToastSeverity } from "@/types/internal/primevue";
import type { AttendeeTableDisplayOptions } from "@/types/internal/system/regdesk";
import type { Ref } from "vue";

export function getOnCheckinFunction(
  updateAttendee: (
    regNumber: RegNumber
  ) => Promise<TransformedAttendeeInfo | null>,
  selectedAttendeeRef: Ref<TransformedAttendeeInfo | null>,
  focusGlobalFilterInputAndResetFilterRef: Ref<(() => void) | null> | null,
  displayOptionsRef: Ref<AttendeeTableDisplayOptions> | null,
  toastService: OnsiteToastService
): (regNumber: RegNumber) => Promise<void> {
  return async (regNumber: RegNumber): Promise<void> => {
    if (authState.value.userRegNumList.includes(regNumber)) {
      toastService.add({
        severity: ToastSeverity.warn,
        summary: `You are trying to check in yourself! Depending on the backend configuration, this might be prohibited!`,
        life: 10000,
      });
    }
    await attendeeService.checkinAttendee(
      getErrorHandlerFunction(toastService),
      regNumber
    );
    await attendeeService.addInfos.putRegDeskDeskAddInfo(
      getErrorHandlerFunction(toastService),
      regNumber,
      {
        checkin_by: authState.value.userName || "",
        checkin_time: new Date().toISOString(),
        has_room_key: false, // FIXME
        car_plate: "", // FIXME
      }
    );
    const updatedAttendee: TransformedAttendeeInfo | null =
      await updateAttendee(regNumber);
    if (updatedAttendee?.status === AttendeeApiStatus.checked_in) {
      toastService.add({
        severity: ToastSeverity.info,
        summary: `Checked in attendee ${regNumber}`,
        life: 2000,
      });
      if (displayOptionsRef) {
        if (displayOptionsRef.value.checkinAutoClose) {
          setTimeout(() => {
            selectedAttendeeRef.value = null;
          }, 250);
        }
        if (
          displayOptionsRef.value.checkinAutoResetFilter &&
          focusGlobalFilterInputAndResetFilterRef &&
          focusGlobalFilterInputAndResetFilterRef.value
        ) {
          setTimeout(focusGlobalFilterInputAndResetFilterRef.value, 300);
        }
      }
    }
  };
}
