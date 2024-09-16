import { convertListToMap } from "@/composables/collection_tools/convertListToMap";
import {
  type AbstractTrinketValue,
  type TrinketConfig,
  configTinketItems,
} from "@/setupEFIteration";

const abstractItemLabelToTrinketConfigMap: Map<
  AbstractTrinketValue,
  TrinketConfig
> = convertListToMap(
  configTinketItems as { value: AbstractTrinketValue; [key: string]: any }[]
);

export function getTrinketFromAbstractItem(
  abstractValue: AbstractTrinketValue
): TrinketConfig | null {
  const findResult: TrinketConfig | undefined =
    abstractItemLabelToTrinketConfigMap.get(abstractValue);
  if (findResult === undefined) {
    return null;
  }
  return findResult;
}
