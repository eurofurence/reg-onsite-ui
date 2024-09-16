import { getConcreteItemValue } from "@/composables/items/getConcreteItemValue";
import { getConcreteVariantItemValue } from "@/composables/items/getConcreteVariantItemValue";
import type { TShirtTypeValue } from "@/config/setupTShirtTypes";
import type { ConcreteTrinketValue, TrinketConfig } from "@/setupEFIteration";
import type { LabeledValue } from "@/types/internal";

export function getConcreteItemsForTrinket(
  trinketConfig: TrinketConfig
): ConcreteTrinketValue[] {
  if (
    trinketConfig?.variants === undefined ||
    trinketConfig?.variants === null
  ) {
    return [getConcreteItemValue(trinketConfig, null)];
  } else {
    return trinketConfig.variants.map(
      (variantConfig: LabeledValue<TShirtTypeValue>) =>
        getConcreteVariantItemValue(trinketConfig, variantConfig)
    );
  }
}
