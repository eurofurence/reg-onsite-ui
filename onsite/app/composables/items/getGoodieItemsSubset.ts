import {
  type AbstractGoodieValue,
  type GoodieConfig,
  configTinketItems,
} from "@/setupEFIteration";

export function getGoodieItemsSubset(
  subset: AbstractGoodieValue[]
): GoodieConfig[] {
  return configTinketItems.filter((entry: GoodieConfig) =>
    subset.includes(entry.value)
  );
}
