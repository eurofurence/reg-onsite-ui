import { concatenateListsForMatchingKeys } from "@/composables/collection_tools/concatenateListsForMatchingKeys";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import type { AbstractGoodieValue } from "@/config/convention";
import type {
  FlagApiValue,
  PackageApiValue,
  PackageCountType,
  RegNumber,
} from "@/types/external/attsrv/attendees/attendee";

export function getEntitledAbstractItems(
  package_count_list: PackageCountType[],
  flags_list: FlagApiValue[],
  reg_id: RegNumber
): AbstractGoodieValue[] {
  const packages_list: PackageApiValue[] = package_count_list.map(
    (item: PackageCountType) => item.name
  );
  const itemsForPackages: AbstractGoodieValue[] =
    concatenateListsForMatchingKeys(
      packages_list,
      getConventionSetup().goodies.forPackage
    );
  const itemsForFlags: AbstractGoodieValue[] = [
    ...new Set(
      concatenateListsForMatchingKeys(
        flags_list,
        getConventionSetup().goodies.forFlag
      )
    ),
  ];
  const itemsForRegNumber: AbstractGoodieValue[] =
    concatenateListsForMatchingKeys(
      [reg_id.toString()],
      getConventionSetup().goodies.forRegNumber
    );
  return [...itemsForPackages, ...itemsForFlags, ...itemsForRegNumber];
}
