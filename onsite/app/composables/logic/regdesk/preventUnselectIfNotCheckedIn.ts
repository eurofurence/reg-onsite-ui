import type { TransformedAttendeeInfo } from "@/types/internal";
import { Status } from "~/config/setupStatus";
import type { ConfirmServiceMethods } from "@/types/external";

export function preventUnselectIfNotCheckedIn(
  selectedAttendeeRef: Ref<TransformedAttendeeInfo | null>,
  confirm: ConfirmServiceMethods,
  confirmGroup: string
): (newValue: TransformedAttendeeInfo) => Promise<void> {
  return async (newValue: TransformedAttendeeInfo): Promise<void> => {
    // Nothing to protect
    if (!selectedAttendeeRef.value) {
      selectedAttendeeRef.value = newValue;
      return;
    }
    // Already checked in
    if (selectedAttendeeRef.value.status === Status.checked_in) {
      selectedAttendeeRef.value = newValue;
      return;
    }
    // Ask user for confirmation
    confirm.require({
      group: confirmGroup,
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
