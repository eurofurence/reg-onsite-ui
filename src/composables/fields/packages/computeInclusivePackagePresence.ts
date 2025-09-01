import type {
  PackageApiValue,
  PackageCountType,
} from "@/types/external/attsrv/attendees/attendee";
import type { PackageValue } from "@/types/internal/fields";
import type { LabeledValue } from "@/types/internal/infos";
import type { Ref, WritableComputedRef } from "vue";

import { getInclusivePackagePresenceChecker } from "@/composables/fields/packages/getInclusivePackagePresenceChecker";
import { getValidPackageValuesFromLabeledValues } from "@/composables/fields/packages/getValidPackageValuesFromLabeledValues";
import { NoPackage } from "@/types/internal/missing";
import { computed } from "vue";

export function computeInclusivePackagePresence<
  OutputType extends PackageValue
>(
  dataRef: Ref<PackageCountType[] | null>,
  subsetItemList: LabeledValue<OutputType>[]
): WritableComputedRef<OutputType[] | null> {
  const getInclusivePackagePresence =
    getInclusivePackagePresenceChecker<OutputType>(subsetItemList);
  const validSubsetValues: PackageApiValue[] =
    getValidPackageValuesFromLabeledValues(subsetItemList);

  return computed<OutputType[] | null>({
    get: (): OutputType[] | null => {
      if (dataRef.value === null) {
        return null;
      }
      return getInclusivePackagePresence(dataRef.value);
    },
    set: (newValue: OutputType[] | null): void => {
      // Ensure dataRef is always an array
      let currentValue: PackageCountType[] = dataRef.value || [];

      // Remove any existing items matching the subset
      currentValue = currentValue.filter(
        (item: PackageCountType) => !validSubsetValues.includes(item.name)
      );

      // If newValue is null or NoPackage, we're done
      if (
        newValue === null ||
        newValue.includes(NoPackage.no_package as OutputType)
      ) {
        dataRef.value = currentValue;
        return;
      }

      // Add the new value
      const newPackageInfos: PackageCountType[] = newValue.map(
        (value: OutputType): PackageCountType => ({
          name: value as PackageApiValue,
          count: 1,
        })
      );
      currentValue = currentValue.concat(newPackageInfos);
      dataRef.value = currentValue;
    },
  });
}
