import { getConcreteItemsForGoodie } from "@/composables/items/getConcreteItemsForGoodie";
import type { ConcreteGoodieValue, GoodieConfig } from "@/config/convention";

// Returns the array index of the n-th (0-based) occurrence of any concrete
// value belonging to goodieConfig's abstract group within list, or -1.
export function findNthOccurrenceIndex(
  list: ConcreteGoodieValue[],
  goodieConfig: GoodieConfig,
  n: number
): number {
  const concreteKeys = new Set(getConcreteItemsForGoodie(goodieConfig));
  let seen = -1;
  for (let index = 0; index < list.length; index++) {
    if (concreteKeys.has(list[index]!)) {
      seen++;
      if (seen === n) {
        return index;
      }
    }
  }
  return -1;
}
