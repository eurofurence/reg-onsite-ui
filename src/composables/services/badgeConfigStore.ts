import { getRegDeskConfig } from "@/composables/api/attsrv/additional-info/getRegDeskConfig";
import { putRegDeskConfig } from "@/composables/api/attsrv/additional-info/putRegDeskConfig";
import type { RestErrorHandler } from "@/composables/api/base/restErrorWrapper";
import { revalidateBadgeMediaUrls } from "@/composables/badge/revalidateBadgeMediaUrls";
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
  await revalidateBadgeMediaUrls(badgeTypesRef.value, errorHandler);
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

const SAVE_THROTTLE_MS = 1000;

function currentBadgeConfigPayload(): string {
  return JSON.stringify({
    badgeTypes: badgeTypesRef.value,
    printSettings: printSettingsRef.value,
    badgeMapping: badgeMappingRef.value,
  });
}

let lastSavedPayload: string | null = null;
let lastSaveTime = 0;
let pendingSave: Promise<void> | null = null;

async function putBadgeConfig(errorHandler: RestErrorHandler): Promise<void> {
  const payload = currentBadgeConfigPayload();
  if (payload === lastSavedPayload) {
    return;
  }
  lastSavedPayload = payload;
  lastSaveTime = Date.now();
  await putRegDeskConfig(errorHandler, { badge: JSON.parse(payload) });
}

export async function saveBadgeConfig(
  errorHandler: RestErrorHandler,
): Promise<void> {
  if (currentBadgeConfigPayload() === lastSavedPayload) {
    return;
  }
  if (pendingSave) {
    return pendingSave;
  }
  const elapsed = Date.now() - lastSaveTime;
  if (elapsed >= SAVE_THROTTLE_MS) {
    await putBadgeConfig(errorHandler);
    return;
  }
  pendingSave = new Promise<void>((resolve) => {
    setTimeout(resolve, SAVE_THROTTLE_MS - elapsed);
  })
    .then(() => putBadgeConfig(errorHandler))
    .finally(() => {
      pendingSave = null;
    });
  return pendingSave;
}
