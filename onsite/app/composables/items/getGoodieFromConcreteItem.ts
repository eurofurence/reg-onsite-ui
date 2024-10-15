import { getConcreteItemsForGoodie } from "@/composables/items/getConcreteItemsForGoodie";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import type { ConcreteGoodieValue, GoodieConfig } from "@/config/convention";

export function getGoodieFromConcreteItem(
  concreteValue: ConcreteGoodieValue
): GoodieConfig | null {
  const findResult: GoodieConfig | undefined =
    getConventionSetup().metadata.forAbstractGoodies.list.find(
      (goodieConfig: GoodieConfig) =>
        getConcreteItemsForGoodie(goodieConfig).includes(concreteValue)
    );
  if (findResult === undefined) {
    return null;
  }
  return findResult;
}
