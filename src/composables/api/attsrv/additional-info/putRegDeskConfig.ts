import { putAddInfo } from "@/composables/api/attsrv/additional-info/putGenericAddInfo";
import type { RestErrorHandler } from "@/composables/api/base/restErrorWrapper";
import type { RegDeskConfigRecord } from "@/composables/api/attsrv/additional-info/getRegDeskConfig";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";

const CONFIG_REG = 0 as RegNumber;

export async function putRegDeskConfig(
  errorHandler: RestErrorHandler,
  config: RegDeskConfigRecord,
): Promise<null | undefined> {
  return await putAddInfo<RegDeskConfigRecord>(
    "Attendee Regdesk Service",
    "regdesk",
    errorHandler,
    CONFIG_REG,
    config,
  );
}
