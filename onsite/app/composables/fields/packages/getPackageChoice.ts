import { getSubsetChoice } from "@/composables/collection_tools/getSubsetChoice";
import { getPurePackageList } from "@/composables/fields/packages/getPurePackageList";
import type {
  PackageApiValue,
  PackageCountType,
} from "@/types/external/attsrv/attendees/attendee";
import type { LabeledValue } from "@/types/internal/infos";

export function getPackageChoice<Type extends PackageApiValue>(
  data: PackageCountType<PackageApiValue>[],
  subsetItemList: LabeledValue<Type | "">[]
): Type | "" | null {
  const purePackagesList: PackageApiValue[] | null = getPurePackageList(data);
  if (purePackagesList === null) {
    return null;
  }
  return getSubsetChoice(purePackagesList, subsetItemList);
}
