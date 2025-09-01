import type {
    PackageApiValue,
    PackageCountType,
} from "@/types/external/attsrv/attendees/attendee";
import type { PackageValue } from "@/types/internal/fields";
import type { LabeledValue } from "@/types/internal/infos";
import { NoPackage } from "@/types/internal/missing";

export function getInclusivePackagePresenceChecker<
  OutputType extends PackageValue
>(
  subsetItemList: LabeledValue<OutputType>[]
): (data: PackageCountType[]) => OutputType[] {
  const validSubsetValues: OutputType[] = subsetItemList.map(
    (item: LabeledValue<OutputType>) => item.value
  );

  return function getInclusivePackagePresence(
    packageInfos: PackageCountType[]
  ): OutputType[] {
    const packageValues: PackageApiValue[] = packageInfos.map(
      (packageInfo: PackageCountType) => packageInfo.name
    );
    const matchingPackageValues: OutputType[] = validSubsetValues.filter(
      (validValue: OutputType) =>
        packageValues.includes(validValue as PackageApiValue)
    );
    if (
      matchingPackageValues.length === 0 &&
      validSubsetValues.includes(NoPackage.no_package as OutputType)
    ) {
      return [NoPackage.no_package] as OutputType[];
    }
    return matchingPackageValues;
  };
}
