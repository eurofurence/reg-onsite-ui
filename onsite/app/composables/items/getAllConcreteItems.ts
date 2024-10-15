import { getConcreteItemsForGoodie } from "@/composables/items/getConcreteItemsForGoodie";
import type { ConcreteGoodieValue, GoodieConfig } from "@/config/convention";

export function getAllConcreteItems(
  goodieConfigList: GoodieConfig[]
): ConcreteGoodieValue[] {
  return goodieConfigList.flatMap(getConcreteItemsForGoodie);
}
