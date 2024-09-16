import type { ConcreteTrinketValue, TrinketConfig } from "@/setupEFIteration";
import type { LabeledValue } from "@/types/internal";

export function getConcreteVariantItemValue<Type>(
  trinketConfig: TrinketConfig,
  variantConfig: LabeledValue<Type>
): ConcreteTrinketValue {
  return <ConcreteTrinketValue>`${trinketConfig.value}_${variantConfig.value}`;
}
