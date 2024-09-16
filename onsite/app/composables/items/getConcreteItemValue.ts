import { getConcreteVariantItemValue } from "@/composables/items/getConcreteVariantItemValue";
import type { ConcreteTrinketValue, TrinketConfig } from "@/setupEFIteration";
import type { LabeledValue } from "@/types/internal";

export function getConcreteItemValue<VariantType>(
  trinketConfig: TrinketConfig,
  variantConfig: LabeledValue<VariantType> | null
): ConcreteTrinketValue {
  if (variantConfig === null || trinketConfig?.variants === undefined) {
    return <ConcreteTrinketValue>trinketConfig.value;
  }
  return getConcreteVariantItemValue(trinketConfig, variantConfig);
}
