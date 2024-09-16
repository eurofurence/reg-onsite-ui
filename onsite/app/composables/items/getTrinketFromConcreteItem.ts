import { getConcreteItemsForTrinket } from "@/composables/items/getConcreteItemsForTrinket";
import {
  type ConcreteTrinketValue,
  type TrinketConfig,
  configTinketItems,
} from "@/setupEFIteration";

export function getTrinketFromConcreteItem(
  concreteValue: ConcreteTrinketValue
): TrinketConfig | null {
  const findResult: TrinketConfig | undefined = configTinketItems.find(
    (trinketConfig: TrinketConfig) =>
      getConcreteItemsForTrinket(trinketConfig).includes(concreteValue)
  );
  if (findResult === undefined) {
    return null;
  }
  return findResult;
}
