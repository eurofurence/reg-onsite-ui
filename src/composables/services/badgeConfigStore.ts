import { getRegDeskConfig } from "@/composables/api/attsrv/additional-info/getRegDeskConfig";
import { putRegDeskConfig } from "@/composables/api/attsrv/additional-info/putRegDeskConfig";
import type { RestErrorHandler } from "@/composables/api/base/restErrorWrapper";
import { createEmptyBadgeMapping, withNoFlag } from "@/types/badgeMapping";
import type { BadgeMapping } from "@/types/badgeMapping";
import { createDefaultBadgeType } from "@/types/badgeType";
import type { BadgeType } from "@/types/badgeType";
import { createDefaultPrintSettings } from "@/types/printSettings";
import type { PrintSettings } from "@/types/printSettings";
import { ref, type Ref } from "vue";

export const badgeTypesRef: Ref<BadgeType[]> = ref<BadgeType[]>([]);
export const printSettingsRef: Ref<PrintSettings> = ref<PrintSettings>(
  createDefaultPrintSettings(),
);
export const badgeMappingRef: Ref<BadgeMapping> = ref<BadgeMapping>(
  createEmptyBadgeMapping(),
);

export async function loadBadgeConfig(
  errorHandler: RestErrorHandler,
): Promise<void> {
  const record = await getRegDeskConfig(errorHandler);
  const badge = record?.badge;
  badgeTypesRef.value =
    badge && badge.badgeTypes.length > 0
      ? badge.badgeTypes
      : [createDefaultBadgeType("Attendee Badge")];
  printSettingsRef.value = badge?.printSettings ?? createDefaultPrintSettings();
  badgeMappingRef.value = badge?.badgeMapping
    ? withNoFlag(badge.badgeMapping)
    : createEmptyBadgeMapping();
}

let badgeConfigLoadPromise: Promise<void> | null = null;

export function ensureBadgeConfigLoaded(
  errorHandler: RestErrorHandler,
): Promise<void> {
  if (!badgeConfigLoadPromise) {
    badgeConfigLoadPromise = loadBadgeConfig(errorHandler);
  }
  return badgeConfigLoadPromise;
}

export async function saveBadgeConfig(
  errorHandler: RestErrorHandler,
): Promise<void> {
  await putRegDeskConfig(errorHandler, {
    badge: {
      badgeTypes: badgeTypesRef.value,
      printSettings: printSettingsRef.value,
      badgeMapping: badgeMappingRef.value,
    },
  });
}
