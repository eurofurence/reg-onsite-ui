import { concatenateListsForMatchingKeys } from "@/composables/collection_tools/concatenateListsForMatchingKeys";
import { getAbstractFromConcreteItems } from "@/composables/items/getAbstractFromConcreteItems";
import { getConcreteItemValue } from "@/composables/items/getConcreteItemValue";
import { getDefaultVariantValues } from "@/composables/items/getDefaultVariantValues";
import { getDefaultVariantValuesValue } from "@/composables/items/getDefaultVariantValuesValue";
import { getGoodieFromAbstractItem } from "@/composables/items/getGoodieFromAbstractItem";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import type {
  FlagApiValue,
  PackageApiValue,
  PackageCountType,
  RegNumber,
} from "@/types/external/attsrv/attendees/attendee";
import type { ApiSponsorDeskAddInfo } from "@/types/external/attsrv/additional-info/sponsordesk";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type { DefaultVariantValues } from "@/types/internal/goodies";
import type { LabeledValue } from "@/types/internal/infos";
import type {
  AbstractGoodieValue,
  ConcreteGoodieValue,
  GoodieConfig,
} from "@/config/convention";

function getLabeledValue(
  defaultVariantValues: DefaultVariantValues,
  abstractGoodieValue: AbstractGoodieValue
): LabeledValue<string | null> | null {
  const defaultVariantValuesValue: string | null | undefined =
    getDefaultVariantValuesValue(defaultVariantValues, abstractGoodieValue);
  if (defaultVariantValuesValue !== undefined) {
    return {
      label: "",
      value: defaultVariantValuesValue,
    };
  }
  return null;
}

function getConcreteItemsFromSponsorInfo(
  apiSponsorDeskAddInfo: ApiSponsorDeskAddInfo
): ConcreteGoodieValue[] {
  return [
    ...new Set([
      ...apiSponsorDeskAddInfo.pastItems,
      ...apiSponsorDeskAddInfo.issuedItems,
      ...apiSponsorDeskAddInfo.reservedItems,
    ]),
  ];
}

function getAbstractItemsFromAttendeeInfo(
  package_count_list: PackageCountType<PackageApiValue>[],
  flags_list: FlagApiValue[],
  reg_id: RegNumber
): AbstractGoodieValue[] {
  const packages_list: PackageApiValue[] = package_count_list.map(
    (item: PackageCountType<PackageApiValue>) => item.name
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

export function getOwedConcreteItems(
  attendee: TransformedAttendeeInfo,
  apiSponsorDeskAddInfo: ApiSponsorDeskAddInfo
): ConcreteGoodieValue[] {
  const owedConcreteItemsFromSponsorInfo: ConcreteGoodieValue[] =
    getConcreteItemsFromSponsorInfo(apiSponsorDeskAddInfo);
  const owedAbstractItemsFromSponsorInfo: AbstractGoodieValue[] =
    getAbstractFromConcreteItems(owedConcreteItemsFromSponsorInfo);
  const owedAbstractItemsFromAttendeeInfo: AbstractGoodieValue[] =
    getAbstractItemsFromAttendeeInfo(
      attendee.packages_list || [],
      attendee.flags_list || [],
      attendee.id || (0 as RegNumber)
    );
  const missingAbstractItems = owedAbstractItemsFromAttendeeInfo.filter(
    (abstractItemFromAttendeeInfo: AbstractGoodieValue) =>
      !owedAbstractItemsFromSponsorInfo.includes(abstractItemFromAttendeeInfo)
  );
  const defaultVariantValues: DefaultVariantValues = getDefaultVariantValues(
    attendee,
    apiSponsorDeskAddInfo
  );
  const goodieConfigList: (GoodieConfig | null)[] = missingAbstractItems.map(
    getGoodieFromAbstractItem
  );
  const cleanedGoodieConfigList: GoodieConfig[] = goodieConfigList.filter(
    (goodieConfig: GoodieConfig | null) => goodieConfig !== null
  );
  const missingConcreteItems = cleanedGoodieConfigList.map(
    (goodieConfig: GoodieConfig) =>
      getConcreteItemValue(
        goodieConfig,
        getLabeledValue(defaultVariantValues, goodieConfig.value)
      )
  );
  return missingConcreteItems.concat(owedConcreteItemsFromSponsorInfo);
}
