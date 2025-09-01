import { getCountryName } from "@/composables/fields/country/getCountryName";
import type { FilterFunctorContainer } from "@/composables/sort_and_filter/getFilterFunctorContainerList";
import type { CountryCode } from "@/config/metadata/metadataForCountry";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import { ColumnType } from "@/types/internal/component/table";
import type { OptionalColoredIconLabeledValue } from "@/types/internal/infos";
import { FilterMatchMode } from "@primevue/core/api";

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

function getMaxLengthOfStrings(array: string[]): number {
  return array.reduce((currentMax: number, stringValue: string) => {
    return Math.max(currentMax, stringValue.length);
  }, 0);
}

function getCountryValueLabelGetter(value: string[]): string {
  const countryCodeList: CountryCode[] = value as CountryCode[];
  let truncatedCountryNameList: string[] = countryCodeList
    .slice(0, 5)
    .map(getCountryName);
  if (countryCodeList.length > 5) {
    return `${truncatedCountryNameList}... (${countryCodeList.length} countries)`;
  }
  return `${truncatedCountryNameList}`;
}

function formatList(
  filterValue: string[],
  labels: OptionalColoredIconLabeledValue<string>[]
) {
  const labelMap = new Map(labels.map((item) => [item.value, item.label]));
  return filterValue
    .map((value) =>
      labelMap.get(value) ? `"${labelMap.get(value)}"` : `"${value}"`
    )
    .join(", ");
}

export function getRawFilterText<Type extends TransformedAttendeeInfo>(
  activeFilters: FilterFunctorContainer<Type>[]
) {
  const labels: string[] = activeFilters.map(
    (value: FilterFunctorContainer<Type>) => value.columnDefintion.label
  );
  const maxLabelLength: number = getMaxLengthOfStrings(labels);

  const lines: string[] = activeFilters.map((filter) => {
    const label: string = filter.columnDefintion.label.padEnd(
      maxLabelLength,
      " "
    );
    const rawMode: string = filter.matchModeString;
    const mode: string = matchModeMap[rawMode] ?? rawMode;
    const value: string =
      filter.columnDefintion.columnType === ColumnType.country
        ? getCountryValueLabelGetter(filter.filterValue)
        : filter.columnDefintion.columnType === ColumnType.tag
        ? formatList(filter.filterValue, filter.columnDefintion.configItems)
        : filter.filterValue;

    return `- ${label} ${mode} ${value}`;
  });

  return `${lines.join("\n")}`;
}

export function getFilterText<Type extends TransformedAttendeeInfo>(
  activeFilters: FilterFunctorContainer<Type>[]
) {
  const fieldFilterFunctorContainerList: FilterFunctorContainer<Type>[] =
    activeFilters.filter(
      (ffc: FilterFunctorContainer<Type>) => !ffc.isFromGlobal
    );
  const globalFilterFunctorContainerList: FilterFunctorContainer<Type>[] =
    activeFilters.filter(
      (ffc: FilterFunctorContainer<Type>) => ffc.isFromGlobal
    );

  const fieldText: string = getRawFilterText(fieldFilterFunctorContainerList);
  const globalText: string = getRawFilterText(globalFilterFunctorContainerList);
  if (
    globalFilterFunctorContainerList.length > 0 &&
    fieldFilterFunctorContainerList.length > 0
  ) {
    return `All of:\n${fieldText}\n\nAny of:\n${globalText}`;
  } else if (fieldFilterFunctorContainerList.length > 0) {
    return `All of:\n${fieldText}`;
  } else if (globalFilterFunctorContainerList.length > 0) {
    return `Any of:\n${globalText}`;
  } else {
    return "No filters applied.";
  }
}
