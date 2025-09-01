import { getConcreteVariantItemValue } from "@/composables/items/getConcreteVariantItemValue";
import type { ConcreteGoodieValue, GoodieConfig } from "@/config/convention";
import type { LabeledValue } from "@/types/internal/infos";

export function getConcreteItemValue<VariantType>(
  goodieConfig: GoodieConfig,
  variantConfig: LabeledValue<VariantType> | null
): ConcreteGoodieValue {
  if (variantConfig === null || goodieConfig?.variants === undefined) {
    return goodieConfig.value as ConcreteGoodieValue;
  }
  return getConcreteVariantItemValue(goodieConfig, variantConfig);
}
