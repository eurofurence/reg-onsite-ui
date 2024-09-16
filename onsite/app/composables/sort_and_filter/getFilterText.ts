import { getActiveFilters } from "@/composables/sort_and_filter/getActiveFilters";
import { FilterMatchMode } from "@primevue/core/api";
import type {
  AllFilterFieldValues,
  CustomFilterMetaData,
  LabeledValue,
  RawAttendeeFilter,
} from "@/types/internal";
import type { DataTableFilterMetaData } from "primevue/datatable";
import { getSponsorItem } from "@/composables/fields/packages/getSponsorItem";
import { getStatusItem } from "../fields/status/getStatusItem";
import { getConRoleItem } from "../fields/conrole/getConRoleItem";
import { getCountryName } from "../fields/country/getCountryName";
import type { CountryCode } from "@/config/setupCountries";

const matchModeMap: Record<string, string> = {
  [FilterMatchMode.STARTS_WITH]: "starts with",
  [FilterMatchMode.CONTAINS]: "contains",
  [FilterMatchMode.NOT_CONTAINS]: "doesn't contain",
  [FilterMatchMode.ENDS_WITH]: "ends with",
  [FilterMatchMode.EQUALS]: "==",
  [FilterMatchMode.NOT_EQUALS]: "!=",
  [FilterMatchMode.IN]: "in",
  [FilterMatchMode.LESS_THAN]: "<",
  [FilterMatchMode.LESS_THAN_OR_EQUAL_TO]: "<=",
  [FilterMatchMode.GREATER_THAN]: ">",
  [FilterMatchMode.GREATER_THAN_OR_EQUAL_TO]: ">=",
  [FilterMatchMode.BETWEEN]: "between",
  [FilterMatchMode.DATE_IS]: "date is",
  [FilterMatchMode.DATE_IS_NOT]: "date isn't",
  [FilterMatchMode.DATE_BEFORE]: "date before",
  [FilterMatchMode.DATE_AFTER]: "date after",
};

function getMatchModeLabel(
  value: DataTableFilterMetaData["matchMode"]
): string {
  return matchModeMap[<string>value] || <string>value;
}

function getMaxLengthOfStrings(array: string[]): number {
  return array.reduce((currentMax: number, stringValue: string) => {
    return Math.max(currentMax, stringValue.length);
  }, 0);
}

function castToString(value: string | string[]): string {
  return <string>value;
}

function createCastAfterLabelMap<Type>(
  lookupItemFun: (value: Type) => LabeledValue<Type>
) {
  return (value: string | string[]) =>
    (<Type[]>value)
      .map(lookupItemFun)
      .map((value: LabeledValue<Type>) => `${value.label}`)
      .join(", ");
}

function getCountryValueLabelGetter(value: string | string[]): string {
  const countryCodeList: CountryCode[] = <CountryCode[]>value;
  var truncatedCountryNameList: string[] = countryCodeList
    .slice(0, 5)
    .map(getCountryName);
  if (countryCodeList.length > 5) {
    return `${truncatedCountryNameList}... (${countryCodeList.length} countries)`;
  }
  return `${truncatedCountryNameList}`;
}

function getValueLabelGetter(): Record<
  AllFilterFieldValues,
  (value: string | string[]) => string
> {
  return {
    global: castToString,
    badge_id: castToString,
    nickname: castToString,
    first_name: castToString,
    last_name: castToString,
    birthday: castToString,
    status: createCastAfterLabelMap(getStatusItem),
    country: getCountryValueLabelGetter,
    transConbookChoice: createCastAfterLabelMap(getConRoleItem),
    transSponsorChoice: createCastAfterLabelMap(getSponsorItem),
    transConRole: createCastAfterLabelMap(getConRoleItem),
  };
}

export function getFilterText(filters: RawAttendeeFilter) {
  const activeFilters: CustomFilterMetaData[] = getActiveFilters(filters);
  const maxLengthLabel: number =
    getMaxLengthOfStrings(
      activeFilters.map((item: CustomFilterMetaData) => item.label)
    ) + 3;
  const maxMatchMode: number = getMaxLengthOfStrings(
    activeFilters.map((item: CustomFilterMetaData) =>
      getMatchModeLabel(item.matchMode)
    )
  );

  function getFilterTextEntry(
    item: CustomFilterMetaData,
    valueLabel: string
  ): string {
    const itemLabel: string = item.label.padStart(maxLengthLabel);
    const matchLabel: string = getMatchModeLabel(item.matchMode).padEnd(
      maxMatchMode
    );
    return `${itemLabel} ${matchLabel} "${valueLabel}"`;
  }

  const valueLabelGetterMap: Record<
    AllFilterFieldValues,
    (value: string | string[]) => string
  > = getValueLabelGetter();
  // Cast: Active filters can't have null filter values
  const result: string[] = activeFilters.map((item: CustomFilterMetaData) =>
    getFilterTextEntry(
      item,
      valueLabelGetterMap[item.fieldName](<string | string[]>item.value)
    )
  );
  return result.join("\n");
}