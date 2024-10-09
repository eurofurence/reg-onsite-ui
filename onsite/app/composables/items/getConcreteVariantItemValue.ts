import type { ConcreteGoodieValue, GoodieConfig } from "@/setupEFIteration";
import type { LabeledValue } from "@/types/internal/infos";

export function getConcreteVariantItemValue<Type>(
  goodieConfig: GoodieConfig,
  variantConfig: LabeledValue<Type>
): ConcreteGoodieValue {
  return `${goodieConfig.value}_${variantConfig.value}` as ConcreteGoodieValue;
}
