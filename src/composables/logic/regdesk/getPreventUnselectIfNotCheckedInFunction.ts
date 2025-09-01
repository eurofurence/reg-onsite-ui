import CustomConfirmDialog from "@/components/dialog/CustomConfirmDialog.vue";
import { AttendeeApiStatus } from "@/config/metadata/metadataForStatus";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import { type Ref, type ShallowRef } from "vue";

export function getPreventUnselectIfNotCheckedInFunction(
  selectedAttendeeRef: Ref<TransformedAttendeeInfo | null>,
  customDialogRef: ShallowRef<typeof CustomConfirmDialog | null>
): (newValue: TransformedAttendeeInfo | null) => Promise<void> {
  async function preventUnselectIfNotCheckedInFunction(
    newValue: TransformedAttendeeInfo | null
  ): Promise<void> {
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

    if (
      customDialogRef.value &&
      (await customDialogRef.value.showConfirmDialogBlocking())
    ) {
      selectedAttendeeRef.value = newValue;
    }
    return;
  }
  return preventUnselectIfNotCheckedInFunction;
}
