import type {
  PackageApiValue,
  PackageCountType,
} from "@/types/external/attsrv/attendees/attendee";
import type { PackageValue } from "@/types/internal/fields";
import type { LabeledValue } from "@/types/internal/infos";
import type { Ref, WritableComputedRef } from "vue";

import { getExclusivePackagePresenceChecker } from "@/composables/fields/packages/getExclusivePackagePresenceChecker";
import { getValidPackageValuesFromLabeledValues } from "@/composables/fields/packages/getValidPackageValuesFromLabeledValues";
import { NoPackage } from "@/types/internal/missing";
import { computed } from "vue";

export function computeExclusivePackagePresence<
  OutputType extends PackageValue
>(
  dataRef: Ref<PackageCountType[] | null>,
  subsetItemList: LabeledValue<OutputType>[]
): WritableComputedRef<OutputType | null> {
  const getExclusivePackagePresence =
    getExclusivePackagePresenceChecker<OutputType>(subsetItemList);
  const validSubsetValues: PackageApiValue[] =
    getValidPackageValuesFromLabeledValues(subsetItemList);

  return computed<OutputType | null>({
    get: () => {
      if (dataRef.value === null) {
        return null;
      }
      return getExclusivePackagePresence(dataRef.value);
    },
    set: (newValue: OutputType | null) => {
      // Ensure dataRef is always an array
      let currentValue: PackageCountType[] = dataRef.value || [];

      // Remove any existing items matching the subset
      currentValue = currentValue.filter(
        (item: PackageCountType) => !validSubsetValues.includes(item.name)
      );

      // If newValue is null or NoPackage, we're done
      if (newValue === null || newValue === NoPackage.no_package) {
        dataRef.value = currentValue;
        return;
      }

      // Add the new value
      currentValue.push({
        name: newValue as PackageApiValue,
        count: 1,
      });
      dataRef.value = currentValue;
    },
  });
}
