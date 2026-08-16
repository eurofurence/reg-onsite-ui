import { getErrorHandlerFunction } from "@/composables/api/base/getErrorHandlerFunction";
import type { BadgePrintHistoryEntry } from "@/composables/services/attendee/badgePrintHistoryEntry";
import { getEmptyRegDeskAddInfo } from "@/composables/services/attendee/getEmptyRegDeskAddInfo";
import { attendeeService } from "@/composables/services/attendeeService";
import type { OnsiteToastService } from "@/composables/services/toastService";
import { authState } from "@/composables/state/authState";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { BadgeType } from "@/types/badgeType";
import { ToastSeverity } from "@/types/internal/primevue";

export async function recordBadgePrintHistory(
  toastService: OnsiteToastService,
  regNumber: RegNumber,
  badgeType: BadgeType,
  fieldValues: Record<string, string>
): Promise<void> {
  const errorHandler = getErrorHandlerFunction(toastService);
  let recordFailed = false;
  const currentAddInfo =
    (await attendeeService.addInfos.getRegDeskDeskAddInfo(
      (info) => { recordFailed = true; errorHandler(info); },
      regNumber
    )) ?? getEmptyRegDeskAddInfo();

  const entry: BadgePrintHistoryEntry = {
    by: authState.value.userName || "",
    when: new Date().toISOString(),
    badgeTypeId: badgeType.id,
    badgeTypeName: badgeType.name,
    fieldValues,
  };
  await attendeeService.addInfos.putRegDeskDeskAddInfo(
    (info) => { recordFailed = true; errorHandler(info); },
    regNumber,
    {
      ...currentAddInfo,
      badgePrintHistory: [
        ...currentAddInfo.badgePrintHistory,
        JSON.stringify(entry),
      ],
    }
  );

  if (recordFailed) {
    toastService.add({
      severity: ToastSeverity.warn,
      summary: `Badge for attendee ${regNumber} was printed, but recording the print history failed. Please note this manually.`,
      life: 10000,
    });
  }
}
