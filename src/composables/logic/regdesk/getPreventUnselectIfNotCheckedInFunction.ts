import CustomConfirmDialog from "@/components/dialog/CustomConfirmDialog.vue";
import { canCheckin } from "@/composables/fields/status/canCheckin";
import type { OnsiteToastService } from "@/composables/services/toastService";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import { ToastSeverity } from "@/types/internal/primevue";
import { type Ref, type ShallowRef } from "vue";

export function getPreventUnselectIfNotCheckedInFunction(
  selectedAttendeeRef: Ref<TransformedAttendeeInfo | null>,
  customDialogRef: ShallowRef<typeof CustomConfirmDialog | null>,
  toastService: OnsiteToastService
): (newValue: TransformedAttendeeInfo | null) => Promise<void> {
  async function preventUnselectIfNotCheckedInFunction(
    newValue: TransformedAttendeeInfo | null
  ): Promise<void> {
    // Nothing to protect
    if (!selectedAttendeeRef.value || selectedAttendeeRef.value.id === null) {
      selectedAttendeeRef.value = newValue;
      return;
    }
    // Only prompt if the attendee could actually be checked in
    if (!canCheckin(selectedAttendeeRef.value)) {
      selectedAttendeeRef.value = newValue;
      return;
    }
    // Ask user for confirmation
    if (!customDialogRef.value) {
      toastService.add({
        severity: ToastSeverity.warn,
        summary: "Could not confirm deselection, please try again",
        life: 5000,
      });
      return;
    }
    if (await customDialogRef.value.showConfirmDialogBlocking()) {
      selectedAttendeeRef.value = newValue;
    }
    return;
  }
  return preventUnselectIfNotCheckedInFunction;
}
