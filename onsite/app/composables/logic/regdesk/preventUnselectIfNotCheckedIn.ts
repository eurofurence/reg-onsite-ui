import { ShortcutScope } from "@/composables/services/keyboardService";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type { OnsiteConfirmService } from "@/composables/services/confirmService";
import { AttendeeApiStatus } from "@/config/metadata/metadataForStatus";

export function preventUnselectIfNotCheckedIn(
  selectedAttendeeRef: Ref<TransformedAttendeeInfo | null>,
  confirmService: OnsiteConfirmService
): (newValue: TransformedAttendeeInfo | null) => void {
  return (newValue: TransformedAttendeeInfo | null): void => {
    // Nothing to protect
    if (!selectedAttendeeRef.value || selectedAttendeeRef.value.id === null) {
      selectedAttendeeRef.value = newValue;
      return;
    }
    // Already checked in
    if (selectedAttendeeRef.value.status === AttendeeApiStatus.checked_in) {
      selectedAttendeeRef.value = newValue;
      return;
    }
    // Ask user for confirmation
    confirmService.require(ShortcutScope.confirm_deselect_not_checkin, {
      message:
        "The attendee was not checked in! Do you want to continue without checking in?",
      header: "Confirm",
      icon: "pi pi-question-circle",
      accept: () => {
        selectedAttendeeRef.value = newValue;
      },
    });
    return;
  };
}
