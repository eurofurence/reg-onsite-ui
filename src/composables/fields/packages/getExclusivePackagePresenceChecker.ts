import { getValidPackageValuesFromLabeledValues } from "@/composables/fields/packages/getValidPackageValuesFromLabeledValues";
import type {
  PackageApiValue,
  PackageCountType,
} from "@/types/external/attsrv/attendees/attendee";
import type { PackageValue } from "@/types/internal/fields";
import type { LabeledValue } from "@/types/internal/infos";
import { NoPackage } from "@/types/internal/missing";

export function getExclusivePackagePresenceChecker<
  OutputType extends PackageValue
>(
  subsetItemList: LabeledValue<OutputType>[]
): (data: PackageCountType[]) => OutputType {
  const validSubsetValues: PackageApiValue[] =
    getValidPackageValuesFromLabeledValues(subsetItemList);

  return function getExclusivePackagePresence(
    data: PackageCountType[]
  ): OutputType {
    const match: PackageCountType | undefined = data.find(
      (packageInfo: PackageCountType) =>
        validSubsetValues.includes(packageInfo.name)
    );
    return (match ? match.name : NoPackage.no_package) as OutputType;
  };
}
