import { getConcreteItemsForGoodie } from "@/composables/items/getConcreteItemsForGoodie";
import {
  type ConcreteGoodieValue,
  type GoodieConfig,
  configTinketItems,
} from "@/setupEFIteration";

export function getGoodieFromConcreteItem(
  concreteValue: ConcreteGoodieValue
): GoodieConfig | null {
  const findResult: GoodieConfig | undefined = configTinketItems.find(
    (goodieConfig: GoodieConfig) =>
      getConcreteItemsForGoodie(goodieConfig).includes(concreteValue)
  );
  if (findResult === undefined) {
    return null;
  }
  return findResult;
}
