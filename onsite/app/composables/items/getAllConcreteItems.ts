import { getConcreteItemsForGoodie } from "@/composables/items/getConcreteItemsForGoodie";
import type { ConcreteGoodieValue, GoodieConfig } from "@/setupEFIteration";

export function getAllConcreteItems(
  goodieConfigList: GoodieConfig[]
): ConcreteGoodieValue[] {
  return goodieConfigList.flatMap(getConcreteItemsForGoodie);
}
