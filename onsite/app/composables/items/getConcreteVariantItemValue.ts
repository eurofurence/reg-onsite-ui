import type { LabeledValue } from "@/types/internal/infos";
import type { ConcreteGoodieValue, GoodieConfig } from "@/config/convention";

export function getConcreteVariantItemValue<Type>(
  goodieConfig: GoodieConfig,
  variantConfig: LabeledValue<Type>
): ConcreteGoodieValue {
  return `${goodieConfig.value}_${variantConfig.value}` as ConcreteGoodieValue;
}
