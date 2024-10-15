import type { AbstractGoodieValue, GoodieConfig } from "@/config/convention";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";

export function getGoodieItemsSubset(
  subset: AbstractGoodieValue[]
): GoodieConfig[] {
  return getConventionSetup().metadata.forAbstractGoodies.list.filter(
    (entry: GoodieConfig) => subset.includes(entry.value)
  );
}
