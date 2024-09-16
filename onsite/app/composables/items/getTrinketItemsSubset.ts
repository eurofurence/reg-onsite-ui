import {
  type AbstractTrinketValue,
  type TrinketConfig,
  configTinketItems,
} from "@/setupEFIteration";

export function getTrinketItemsSubset(
  subset: AbstractTrinketValue[]
): TrinketConfig[] {
  return configTinketItems.filter((entry: TrinketConfig) =>
    subset.includes(entry.value)
  );
}
