import { getTrinketFromConcreteItem } from "@/composables/items/getTrinketFromConcreteItem";
import type {
  AbstractTrinketValue,
  ConcreteTrinketValue,
  TrinketConfig,
} from "@/setupEFIteration";

export function getAbstractFromConcreteItems(
  concreteItems: ConcreteTrinketValue[]
): AbstractTrinketValue[] {
  const trinketConfigList: (TrinketConfig | null)[] = <TrinketConfig[]>(
    concreteItems.map(getTrinketFromConcreteItem)
  );
  const validTrinketConfigList: TrinketConfig[] = <TrinketConfig[]>(
    trinketConfigList.filter((entry: TrinketConfig | null) => entry !== null)
  );
  return validTrinketConfigList.map((entry: TrinketConfig) => entry.value);
}
