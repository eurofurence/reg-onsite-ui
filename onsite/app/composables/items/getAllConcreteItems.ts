import { getConcreteItemsForTrinket } from "@/composables/items/getConcreteItemsForTrinket";
import type { ConcreteTrinketValue, TrinketConfig } from "@/setupEFIteration";

export function getAllConcreteItems(
  trinketConfigList: TrinketConfig[]
): ConcreteTrinketValue[] {
  return trinketConfigList.flatMap(getConcreteItemsForTrinket);
}
