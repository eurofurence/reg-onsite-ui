import type { PackageApiValue } from "@/types/external/attsrv/attendees/attendee";
import type { PackageValue } from "@/types/internal/fields";
import type { LabeledValue } from "@/types/internal/infos";
import { NoPackage } from "@/types/internal/missing";

export function getValidPackageValuesFromLabeledValues<
  OutputType extends PackageValue
>(subsetItemList: LabeledValue<OutputType>[]): PackageApiValue[] {
  return subsetItemList
    .map((entry) => entry.value)
    .filter((value) => value !== NoPackage.no_package) as PackageApiValue[];
}
