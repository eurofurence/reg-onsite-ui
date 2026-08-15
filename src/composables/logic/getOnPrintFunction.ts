import { resolveBadgeTypeForAttendee } from "@/composables/badge/resolveBadgeTypeForAttendee";
import { resolveBadgeType } from "@/composables/badge/badgeTypeInheritance";
import { buildFieldValuesForAttendee } from "@/composables/badge/buildFieldValues";
import { getErrorHandlerFunction } from "@/composables/api/base/getErrorHandlerFunction";
import { printSingleBadge } from "@/composables/print/printSingleBadge";
import { badgeMappingRef, badgeTypesRef, ensureBadgeConfigLoaded } from "@/composables/services/badgeConfigStore";
import type { OnsiteToastService } from "@/composables/services/toastService";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { BadgeType } from "@/types/badgeType";
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

    const badgeType: BadgeType | null = resolveBadgeTypeForAttendee(
      attendee,
      badgeMappingRef.value,
      badgeTypesRef.value
    );

    if (badgeType !== null) {
      const resolvedBadgeType = resolveBadgeType(
        badgeTypesRef.value,
        badgeType.id
      );
      const fieldValues = buildFieldValuesForAttendee(
        resolvedBadgeType,
        attendee
      );
      try {
        await printSingleBadge(badgeType, fieldValues);
      } catch {
        toastService.add({
          severity: ToastSeverity.error,
          summary: `Failed to print badge for attendee ${regNumber}`,
          life: 5000,
        });
        return;
      }
      toastService.add({
        severity: ToastSeverity.info,
        summary: `Printed badge for attendee ${regNumber}`,
        life: 2000,
      });
      return;
    }

    printRequestRef.value = { attendee };
  };
}
