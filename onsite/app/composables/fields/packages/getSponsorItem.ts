import { convertListToMap } from "@/composables/collection_tools/convertListToMap";
import type { GoodiesLevelValue } from "@/config/packages/setupPackages";
import { setupSponsorLevels } from "@/config/packages/setupSponsorLevels";
import type { PackageInfo } from "@/types/internal";

const propertyMap: Map<
  GoodiesLevelValue,
  PackageInfo<GoodiesLevelValue>
> = convertListToMap(setupSponsorLevels);

export function getSponsorItem(
  value: GoodiesLevelValue
): PackageInfo<GoodiesLevelValue> {
  const result: PackageInfo<GoodiesLevelValue> | undefined =
    propertyMap.get(value);
  if (result === undefined) {
    throw new Error(`Invalid package level ${value}`);
  }
  return result;
}
