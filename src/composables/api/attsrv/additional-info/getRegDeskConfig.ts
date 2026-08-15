import { getAddInfo } from "@/composables/api/attsrv/additional-info/getGenericAddInfo";
import type { RestErrorHandler } from "@/composables/api/base/restErrorWrapper";
import type { BadgeMapping } from "@/types/badgeMapping";
import type { BadgeType } from "@/types/badgeType";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { PrintSettings } from "@/types/printSettings";

export interface RegDeskBadgeConfig {
  badgeTypes: BadgeType[];
  printSettings: PrintSettings;
  badgeMapping: BadgeMapping;
}

export interface RegDeskConfigRecord {
  badge?: RegDeskBadgeConfig;
}

const CONFIG_REG = 0 as RegNumber;

export async function getRegDeskConfig(
  errorHandler: RestErrorHandler,
): Promise<RegDeskConfigRecord | null | undefined> {
  return await getAddInfo<RegDeskConfigRecord>(
    "Attendee Regdesk Service",
    "regdesk",
    errorHandler,
    CONFIG_REG,
  );
}
