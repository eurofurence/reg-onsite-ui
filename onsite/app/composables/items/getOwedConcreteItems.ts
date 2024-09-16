import { concatenateListsForMatchingKeys } from "@/composables/collection_tools/concatenateListsForMatchingKeys";
import { getAbstractFromConcreteItems } from "@/composables/items/getAbstractFromConcreteItems";
import { getConcreteItemValue } from "@/composables/items/getConcreteItemValue";
import { getDefaultVariantValues } from "@/composables/items/getDefaultVariantValues";
import { getDefaultVariantValuesValue } from "@/composables/items/getDefaultVariantValuesValue";
import { getTrinketFromAbstractItem } from "@/composables/items/getTrinketFromAbstractItem";
import {
  configFlagsToItemsMap,
  configPackageToItemsMap,
  configRegNumbersToItemsMap,
} from "@/setupEFIteration";
import type {
  AbstractTrinketValue,
  ConcreteTrinketValue,
  TrinketConfig,
} from "@/setupEFIteration";
import type {
  FlagApiValue,
  PackageApiValue,
  PackageCountType,
} from "@/types/external";
import type { ApiSponsorDeskAddInfo } from "@/types/external";
import type { TransformedAttendeeInfo } from "@/types/internal";
import type { DefaultVariantValues, LabeledValue } from "@/types/internal";

function getLabeledValue(
  defaultVariantValues: DefaultVariantValues,
  abstractTrinketValue: AbstractTrinketValue
): LabeledValue<string | null> | null {
  const defaultVariantValuesValue: string | null | undefined =
    getDefaultVariantValuesValue(defaultVariantValues, abstractTrinketValue);
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
): ConcreteTrinketValue[] {
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
  reg_id: number
): AbstractTrinketValue[] {
  const packages_list: PackageApiValue[] = package_count_list.map(
    (item: PackageCountType<PackageApiValue>) => item.name
  );
  const itemsForPackages: AbstractTrinketValue[] =
    concatenateListsForMatchingKeys(packages_list, configPackageToItemsMap);
  const itemsForFlags: AbstractTrinketValue[] = concatenateListsForMatchingKeys(
    flags_list,
    configFlagsToItemsMap
  );
  const itemsForRegNumber: AbstractTrinketValue[] =
    concatenateListsForMatchingKeys(
      [reg_id.toString()],
      configRegNumbersToItemsMap
    );
  return [
    ...new Set([...itemsForFlags, ...itemsForPackages, ...itemsForRegNumber]),
  ];
}

export function getOwedConcreteItems(
  attendee: TransformedAttendeeInfo,
  apiSponsorDeskAddInfo: ApiSponsorDeskAddInfo
): ConcreteTrinketValue[] {
  const owedConcreteItemsFromSponsorInfo: ConcreteTrinketValue[] =
    getConcreteItemsFromSponsorInfo(apiSponsorDeskAddInfo);
  const owedAbstractItemsFromSponsorInfo: AbstractTrinketValue[] =
    getAbstractFromConcreteItems(owedConcreteItemsFromSponsorInfo);
  const owedAbstractItemsFromAttendeeInfo: AbstractTrinketValue[] =
    getAbstractItemsFromAttendeeInfo(
      attendee.packages_list || [],
      attendee.flags_list || [],
      attendee.id || 0
    );
  const missingAbstractItems = owedAbstractItemsFromAttendeeInfo.filter(
    (abstractItemFromAttendeeInfo: AbstractTrinketValue) =>
      !owedAbstractItemsFromSponsorInfo.includes(abstractItemFromAttendeeInfo)
  );
  const defaultVariantValues: DefaultVariantValues = getDefaultVariantValues(
    attendee,
    apiSponsorDeskAddInfo
  );
  const trinketConfigList: (TrinketConfig | null)[] = missingAbstractItems.map(
    getTrinketFromAbstractItem
  );
  const cleanedTrinketConfigList: TrinketConfig[] = <TrinketConfig[]>(
    trinketConfigList.filter(
      (trinketConfig: TrinketConfig | null) => trinketConfig !== null
    )
  );
  const missingConcreteItems = cleanedTrinketConfigList.map(
    (trinketConfig: TrinketConfig) =>
      getConcreteItemValue(
        trinketConfig,
        getLabeledValue(defaultVariantValues, trinketConfig.value)
      )
  );
  return missingConcreteItems.concat(owedConcreteItemsFromSponsorInfo);
}
