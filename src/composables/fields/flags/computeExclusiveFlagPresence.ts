import { getExclusiveFlagPresenceChecker } from "@/composables/fields/flags/getExclusiveFlagPresenceChecker";
import { getValidFlagValuesFromLabeledValues } from "@/composables/fields/flags/getValidFlagValuesFromLabeledValues";
import type { FlagApiValue } from "@/types/external/attsrv/attendees/attendee";
import type { FlagValue } from "@/types/internal/fields";
import type { LabeledValue } from "@/types/internal/infos";
import { NoFlag } from "@/types/internal/missing";
import { computed, type Ref, type WritableComputedRef } from "vue";

export function computeExclusiveFlagPresence<OutputType extends FlagValue>(
  dataRef: Ref<FlagApiValue[] | null>,
  subsetItemList: LabeledValue<OutputType>[]
): WritableComputedRef<OutputType | null> {
  const getExclusiveFlagPresence =
    getExclusiveFlagPresenceChecker<OutputType>(subsetItemList);
  const validSubsetValues: FlagApiValue[] =
    getValidFlagValuesFromLabeledValues(subsetItemList);

  return computed<OutputType | null>({
    get: () => {
      if (dataRef.value === null) {
        return null;
      }
      return getExclusiveFlagPresence(dataRef.value);
    },
    set: (newValue: OutputType | null) => {
      // Ensure dataRef is always an array
      let currentValue: FlagApiValue[] = dataRef.value || [];

      // Remove matching subset values
      currentValue = currentValue.filter(
        (item: FlagApiValue) => !validSubsetValues.includes(item)
      );

      // If newValue is null or NoFlag, skip adding
      if (newValue === null || newValue === NoFlag.no_flag) {
        dataRef.value = currentValue;
        return;
      }

      // Add the new value
      currentValue.push(newValue as FlagApiValue);
      dataRef.value = currentValue;
    },
  });
}
