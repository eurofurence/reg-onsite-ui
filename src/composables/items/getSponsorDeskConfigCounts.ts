import { getSponsorDeskConfig } from "@/composables/api/attsrv/additional-info/getSponsorDeskConfig";
import type { RestErrorHandler } from "@/composables/api/base/restErrorWrapper";

export interface SponsorDeskConfigCounts {
  soldCount: Record<string, number>;
  inventoryCount: Record<string, number>;
}

export async function getSponsorDeskConfigCounts(
  errorHandler: RestErrorHandler,
): Promise<SponsorDeskConfigCounts> {
  const config = await getSponsorDeskConfig(errorHandler);
  const soldCount: Record<string, number> = {};
  for (const item of config?.soldItems ?? []) soldCount[item] = (soldCount[item] ?? 0) + 1;
  return { soldCount, inventoryCount: config?.inventoryCounts ?? {} };
}
