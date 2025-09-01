import { getConcreteItemValue } from "@/composables/items/getConcreteItemValue";
import { getConcreteVariantItemValue } from "@/composables/items/getConcreteVariantItemValue";
import type { ConcreteGoodieValue, GoodieConfig } from "@/config/convention";
import type { TShirtTypeValue } from "@/config/metadata/tshirt/metadataForTShirtTypes";
import type { LabeledValue } from "@/types/internal/infos";

export function getConcreteItemsForGoodie(
  goodieConfig: GoodieConfig
): ConcreteGoodieValue[] {
  if (goodieConfig?.variants === undefined || goodieConfig?.variants === null) {
    return [getConcreteItemValue(goodieConfig, null)];
  } else {
    return goodieConfig.variants.map(
      (variantConfig: LabeledValue<TShirtTypeValue>) =>
        getConcreteVariantItemValue(goodieConfig, variantConfig)
    );
  }
}
