import { convertListToMap } from "@/composables/collection_tools/convertListToMap";
import {
  type AbstractGoodieValue,
  type GoodieConfig,
  configTinketItems,
} from "@/setupEFIteration";

const abstractItemLabelToGoodieConfigMap: Map<
  AbstractGoodieValue,
  GoodieConfig
> = convertListToMap(
  configTinketItems as { value: AbstractGoodieValue; [key: string]: any }[]
);

export function getGoodieFromAbstractItem(
  abstractValue: AbstractGoodieValue
): GoodieConfig | null {
  const findResult: GoodieConfig | undefined =
    abstractItemLabelToGoodieConfigMap.get(abstractValue);
  if (findResult === undefined) {
    return null;
  }
  return findResult;
}
