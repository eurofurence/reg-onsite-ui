import { convertListToMap } from "@/composables/collection_tools/convertListToMap";
import type { GoodiesLevelValue } from "@/config/metadata/packages/metadataForPerks";
import { metadataListForSponsorLevels } from "@/config/metadata/packages/metadataForSponsorLevels";
import type { PackageInfo } from "@/types/internal/infos";

const propertyMap: Map<
  GoodiesLevelValue,
  PackageInfo<GoodiesLevelValue>
> = convertListToMap(metadataListForSponsorLevels);

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
