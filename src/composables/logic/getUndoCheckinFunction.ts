import { getErrorHandlerFunction } from "@/composables/api/base/getErrorHandlerFunction";
import { attendeeService } from "@/composables/services/attendeeService";
import { environmentSettings } from "@/composables/services/environmentService";
import type { OnsiteToastService } from "@/composables/services/toastService";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import { EnvName } from "@/types/internal/env";

export function getUndoCheckinFunction(
  updateAttendee: (
    regNumber: RegNumber
  ) => Promise<TransformedAttendeeInfo | null>,
  toastService: OnsiteToastService
): (regNumber: RegNumber) => Promise<void> {
  return async (regNumber: RegNumber): Promise<void> => {
    if (environmentSettings.envName !== EnvName.dev) {
      return;
    }
    await attendeeService.debugSetStatusToPaid(
      getErrorHandlerFunction(toastService),
      regNumber
    );
    await updateAttendee(regNumber);
  };
}
