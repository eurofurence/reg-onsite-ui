import { getGoodieFromConcreteItem } from "@/composables/items/getGoodieFromConcreteItem";
import type {
  AbstractGoodieValue,
  ConcreteGoodieValue,
  GoodieConfig,
} from "@/config/convention";

export function getAbstractFromConcreteItems(
  concreteItems: ConcreteGoodieValue[]
): AbstractGoodieValue[] {
  const goodieConfigList: (GoodieConfig | null)[] = concreteItems.map(
    getGoodieFromConcreteItem
  );
  const validGoodieConfigList: GoodieConfig[] = goodieConfigList.filter(
    (entry: GoodieConfig | null) => entry !== null
  );
  return validGoodieConfigList.map((entry: GoodieConfig) => entry.value);
}
