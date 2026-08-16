import { getErrorHandlerFunction } from "@/composables/api/base/getErrorHandlerFunction";
import { ensureBadgeConfigLoaded } from "@/composables/services/badgeConfigStore";
import type { OnsiteToastService } from "@/composables/services/toastService";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import { ToastSeverity } from "@/types/internal/primevue";
import type { Ref } from "vue";

export interface PrintBadgeRequest {
  attendee: TransformedAttendeeInfo;
}

export function getOnPrintFunction(
  selectedAttendeeRef: Ref<TransformedAttendeeInfo | null>,
  printRequestRef: Ref<PrintBadgeRequest | null>,
  toastService: OnsiteToastService
): (regNumber: RegNumber) => Promise<void> {
  return async (regNumber: RegNumber): Promise<void> => {
    const attendee: TransformedAttendeeInfo | null =
      selectedAttendeeRef.value;
    if (attendee === null || attendee.id !== regNumber) {
      toastService.add({
        severity: ToastSeverity.warn,
        summary: `Could not print badge for attendee ${regNumber}: selection changed`,
        life: 5000,
      });
      return;
    }

    await ensureBadgeConfigLoaded(getErrorHandlerFunction(toastService));

    printRequestRef.value = { attendee };
  };
}
