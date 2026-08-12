import { getSponsorDeskConfig } from "@/composables/api/attsrv/additional-info/getSponsorDeskConfig";
import type { SponsorDeskConfigRecord } from "@/composables/api/attsrv/additional-info/getSponsorDeskConfig";
import { putSponsorDeskConfig } from "@/composables/api/attsrv/additional-info/putSponsorDeskConfig";
import type { RestErrorHandler } from "@/composables/api/base/restErrorWrapper";
import { getAllConcreteItems } from "@/composables/items/getAllConcreteItems";
import { getGoodieItemsSubset } from "@/composables/items/getGoodieItemsSubset";
import type { AbstractGoodieValue, ConcreteGoodieValue } from "@/config/convention";
import type { SponsorDeskSettings } from "@/types/internal/system/sponsordesk";
import { onUnmounted, ref, watch, type Ref } from "vue";

export function useAvailableItems(
  deskItemSubset: AbstractGoodieValue[],
  errorHandler: RestErrorHandler,
): Ref<SponsorDeskSettings> {
  const defaultAvailable: ConcreteGoodieValue[] = getAllConcreteItems(getGoodieItemsSubset(deskItemSubset));
  const settings: Ref<SponsorDeskSettings> = ref({ available: defaultAvailable });

  let cachedConfig: SponsorDeskConfigRecord | null = null;
  let saveTimer: ReturnType<typeof setTimeout> | null = null;
  let ignoreNextChange = false;

  async function load(): Promise<void> {
    const config = await getSponsorDeskConfig(errorHandler);
    cachedConfig = config ?? {};
    if (config?.availableItems != null) {
      ignoreNextChange = true;
      settings.value = { available: config.availableItems };
    }
  }

  async function save(available: ConcreteGoodieValue[]): Promise<void> {
    const newConfig: SponsorDeskConfigRecord = { ...(cachedConfig ?? {}), availableItems: available };
    const result = await putSponsorDeskConfig(errorHandler, newConfig);
    if (result !== undefined) cachedConfig = newConfig;
  }

  load();

  watch(
    settings,
    (newVal) => {
      if (ignoreNextChange) { ignoreNextChange = false; return; }
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(() => save(newVal.available), 1000);
    },
    { deep: true },
  );

  onUnmounted(() => {
    if (saveTimer) {
      clearTimeout(saveTimer);
      save(settings.value.available);
    }
  });

  return settings;
}
