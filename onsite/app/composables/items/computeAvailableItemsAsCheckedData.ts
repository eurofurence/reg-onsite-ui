import { getRecordEntries } from "@/composables/collection_tools/getRecordEntries";
import { getConcreteItemValue } from "@/composables/items/getConcreteItemValue";
import type { TShirtTypeValue } from "@/config/metadata/tshirt/metadataForTShirtTypes";
import type { WritableComputedRef } from "vue";
import type { LabeledValue } from "@/types/internal/infos";
import type {
  AbstractGoodieValue,
  ConcreteGoodieValue,
  GoodieConfig,
} from "@/config/convention";

interface CheckedItemData {
  checked: boolean;
  partialChecked: boolean;
}

export type CheckedData = Partial<Record<ConcreteGoodieValue, CheckedItemData>>;

export function computeAvailableItemsAsCheckedData(
  availableItemsRef: Ref<ConcreteGoodieValue[]>,
  allGoodieItems: GoodieConfig[]
): WritableComputedRef<CheckedData> {
  return computed<CheckedData>({
    get: () => {
      var result: CheckedData = {};
      allGoodieItems.forEach((item: GoodieConfig) => {
        const concreteGoodieValue: ConcreteGoodieValue = getConcreteItemValue(
          item,
          null
        );
        if (item?.variants === undefined || item?.variants === null) {
          if (availableItemsRef.value.includes(concreteGoodieValue)) {
            result[concreteGoodieValue] = {
              checked: true,
              partialChecked: false,
            };
          }
        } else {
          var hasActiveVariant = false;
          var hasInActiveVariant = false;
          item.variants.forEach((variant: LabeledValue<TShirtTypeValue>) => {
            const concreteGoodieVariantValue: ConcreteGoodieValue =
              getConcreteItemValue(item, variant);
            if (availableItemsRef.value.includes(concreteGoodieVariantValue)) {
              hasActiveVariant = true;
              result[concreteGoodieVariantValue] = {
                checked: true,
                partialChecked: false,
              };
            } else {
              hasInActiveVariant = true;
            }
          });
          if (hasActiveVariant && hasInActiveVariant) {
            result[concreteGoodieValue] = {
              checked: false,
              partialChecked: true,
            };
          } else if (hasActiveVariant && !hasInActiveVariant) {
            result[concreteGoodieValue] = {
              checked: true,
              partialChecked: false,
            };
          }
        }
      });
      return result;
    },
    set: (new_value: CheckedData) => {
      const itemsWithVariants: AbstractGoodieValue[] = allGoodieItems
        .filter(
          (item: GoodieConfig) =>
            item?.variants !== undefined && item?.variants !== null
        )
        .map((item: GoodieConfig) => item.value);
      const newAvailableItems: ConcreteGoodieValue[] = getRecordEntries(
        new_value
      )
        .filter(
          ([key, value]: [ConcreteGoodieValue, CheckedItemData]) =>
            value.checked &&
            !itemsWithVariants.includes(key as AbstractGoodieValue)
        )
        .map(([key, _value]: [ConcreteGoodieValue, CheckedItemData]) => key);
      availableItemsRef.value = newAvailableItems;
    },
  });
}
