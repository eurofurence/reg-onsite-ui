import { concatenateListsForMatchingKeys } from "@/composables/collection_tools/concatenateListsForMatchingKeys";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import type { AbstractGoodieValue } from "@/config/convention";
import type {
  FlagApiValue,
  PackageCountType,
  RegNumber,
} from "@/types/external/attsrv/attendees/attendee";

export function getEntitledAbstractItems(
  package_count_list: PackageCountType[],
  flags_list: FlagApiValue[],
  reg_id: RegNumber
): AbstractGoodieValue[] {
  const itemsForPackages: AbstractGoodieValue[] = package_count_list.flatMap(
    (item: PackageCountType) => {
      const itemsForThisPackage: AbstractGoodieValue[] =
        concatenateListsForMatchingKeys(
          [item.name],
          getConventionSetup().goodies.forPackage
        );
      return Array(Math.max(0, item.count)).fill(itemsForThisPackage).flat();
    }
  );
  const itemsForFlags: AbstractGoodieValue[] = concatenateListsForMatchingKeys(
    flags_list,
    getConventionSetup().goodies.forFlag
  );
  const itemsForRegNumber: AbstractGoodieValue[] =
    concatenateListsForMatchingKeys(
      [reg_id.toString()],
      getConventionSetup().goodies.forRegNumber
    );
  return [...itemsForPackages, ...itemsForFlags, ...itemsForRegNumber];
}
