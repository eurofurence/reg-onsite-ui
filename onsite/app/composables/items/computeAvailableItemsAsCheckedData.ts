import { getRecordEntries } from "@/composables/collection_tools/getRecordEntries";
import { getConcreteItemValue } from "@/composables/items/getConcreteItemValue";
import type { TShirtTypeValue } from "@/config/setupTShirtTypes";
import type {
  AbstractTrinketValue,
  ConcreteTrinketValue,
  TrinketConfig,
} from "@/setupEFIteration";
import type { LabeledValue } from "@/types/internal";
import type { WritableComputedRef } from "vue";

interface CheckedItemData {
  checked: boolean;
  partialChecked: boolean;
}

export type CheckedData = Partial<
  Record<ConcreteTrinketValue, CheckedItemData>
>;

export function computeAvailableItemsAsCheckedData(
  availableItemsRef: Ref<ConcreteTrinketValue[]>,
  allTrinketItems: TrinketConfig[]
): WritableComputedRef<CheckedData> {
  return computed<CheckedData>({
    get: () => {
      var result: CheckedData = {};
      allTrinketItems.forEach((item: TrinketConfig) => {
        const concreteTrinketValue: ConcreteTrinketValue = getConcreteItemValue(
          item,
          null
        );
        if (item?.variants === undefined || item?.variants === null) {
          if (availableItemsRef.value.includes(concreteTrinketValue)) {
            result[concreteTrinketValue] = {
              checked: true,
              partialChecked: false,
            };
          }
        } else {
          var hasActiveVariant = false;
          var hasInActiveVariant = false;
          item.variants.forEach((variant: LabeledValue<TShirtTypeValue>) => {
            const concreteTrinketVariantValue: ConcreteTrinketValue =
              getConcreteItemValue(item, variant);
            if (availableItemsRef.value.includes(concreteTrinketVariantValue)) {
              hasActiveVariant = true;
              result[concreteTrinketVariantValue] = {
                checked: true,
                partialChecked: false,
              };
            } else {
              hasInActiveVariant = true;
            }
          });
          if (hasActiveVariant && hasInActiveVariant) {
            result[concreteTrinketValue] = {
              checked: false,
              partialChecked: true,
            };
          } else if (hasActiveVariant && !hasInActiveVariant) {
            result[concreteTrinketValue] = {
              checked: true,
              partialChecked: false,
            };
          }
        }
      });
      return result;
    },
    set: (new_value: CheckedData) => {
      const itemsWithVariants: AbstractTrinketValue[] = allTrinketItems
        .filter(
          (item: TrinketConfig) =>
            item?.variants !== undefined && item?.variants !== null
        )
        .map((item: TrinketConfig) => item.value);
      const newAvailableItems: ConcreteTrinketValue[] = getRecordEntries(
        new_value
      )
        .filter(
          ([key, value]: [ConcreteTrinketValue, CheckedItemData]) =>
            value.checked &&
            !itemsWithVariants.includes(key as AbstractTrinketValue)
        )
        .map(([key, _value]: [ConcreteTrinketValue, CheckedItemData]) => key);
      availableItemsRef.value = newAvailableItems;
    },
  });
}
