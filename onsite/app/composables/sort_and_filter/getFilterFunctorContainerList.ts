import { getFieldGetters } from "@/composables/sort_and_filter/getFieldGetters";
import { getMatcherStringAgainstValue } from "@/composables/filter/getMatcherStringAgainstValue";
import type { DataTableFilterMetaData } from "primevue/datatable";
import { setupColumnDefinitionList } from "@/config/system/regdesk";
import { getMatcherStringAgainstList } from "@/composables/filter/getMatcherStringAgainstList";
import { getBirthdayFilterString } from "@/composables/fields/birthday/getBirthdayFilterString";
import { getMatcherNumberAgainstValue } from "@/composables/filter/getMatcherNumberAgainstValue";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type { ValueGetter } from "@/types/internal/sort";
import type { ColumnDefinition } from "@/types/internal/component/table";
import {
  FilterCmpType,
  type FilterCmpTypeValue,
  type FilterFieldValue,
  type MatchNumberAgainstValue,
  type MatchStringAgainstList,
  type MatchStringAgainstValue,
  type RawAttendeeFilter,
} from "@/types/internal/filter";

interface PreparedMatchFunction<Type> {
  (item: Type): boolean;
}

export interface FilterFunctorContainer<Type extends TransformedAttendeeInfo> {
  filterValue: any;
  matchModeString: string;
  matchFunction: PreparedMatchFunction<Type>;
  fieldGetFunction: ValueGetter<Type>;
  columnDefintion: ColumnDefinition;
  isFromGlobal: boolean;
}

function getFieldGetFunction<Type extends TransformedAttendeeInfo>(
  fieldResolvers: { [key: string]: ValueGetter<Type> },
  fieldName: string
): ValueGetter<Type> {
  const result: ValueGetter<Type> | undefined = fieldResolvers[fieldName];
  if (result === undefined) {
    throw new Error(`No field getter exists for ${fieldName}!`);
  }
  return result;
}

interface AddFilterInterface<Type extends TransformedAttendeeInfo> {
  result: FilterFunctorContainer<Type>[];
  fieldResolvers: { [key: string]: ValueGetter<Type> };
  columnDefintion: ColumnDefinition;
}

function parseNumberFromDataTableFilterMetaData(
  filterMeta: DataTableFilterMetaData
): number | null {
  if (filterMeta.value === null || filterMeta.matchMode === undefined) {
    return null;
  }
  const filterValue: number = parseInt(filterMeta.value);
  if (isNaN(filterValue)) {
    return null;
  }
  return filterValue;
}

function addNumberValueFilter<Type extends TransformedAttendeeInfo>(
  param: AddFilterInterface<Type>,
  fieldName: string,
  isFromGlobal: boolean,
  filterMeta: DataTableFilterMetaData
): void {
  const filterValue: number | null =
    parseNumberFromDataTableFilterMetaData(filterMeta);
  if (filterValue === null) {
    return;
  }
  const closureMatchFunction: MatchNumberAgainstValue =
    getMatcherNumberAgainstValue(filterMeta);
  const closureFieldGetFunction: ValueGetter<Type> = getFieldGetFunction(
    param.fieldResolvers,
    fieldName
  );
  const matchFunction: PreparedMatchFunction<Type> = (item: Type): boolean => {
    const dataValue: number = closureFieldGetFunction(item) as number;
    return closureMatchFunction(dataValue, filterValue);
  };
  const entry: FilterFunctorContainer<Type> = {
    filterValue: filterValue,
    matchModeString: filterMeta.matchMode as any,
    fieldGetFunction: closureFieldGetFunction,
    columnDefintion: param.columnDefintion,
    matchFunction: matchFunction,
    isFromGlobal: isFromGlobal,
  };
  param.result.push(entry);
}

function parseStringFromDataTableFilterMetaDataCI(
  filterMeta: DataTableFilterMetaData
): string | null {
  if (filterMeta.value === null || filterMeta.matchMode === undefined) {
    return null;
  }
  const filterValue: string = filterMeta.value.trim().toLowerCase();
  if (filterValue === "") {
    return null;
  }
  return filterValue;
}

function addValueFilter<Type extends TransformedAttendeeInfo>(
  param: AddFilterInterface<Type>,
  fieldName: string,
  isFromGlobal: boolean,
  filterMeta: DataTableFilterMetaData
): void {
  const filterValue: string | null =
    parseStringFromDataTableFilterMetaDataCI(filterMeta);
  if (filterValue === null) {
    return;
  }
  const closureMatchFunction: MatchStringAgainstValue =
    getMatcherStringAgainstValue(filterMeta);
  const closureFieldGetFunction: ValueGetter<Type> = getFieldGetFunction(
    param.fieldResolvers,
    fieldName
  );
  const matchFunction: PreparedMatchFunction<Type> = (item: Type): boolean => {
    const dataValue: string = closureFieldGetFunction(item) as string;
    return closureMatchFunction(dataValue, filterValue);
  };
  const entry: FilterFunctorContainer<Type> = {
    filterValue: filterValue,
    matchModeString: filterMeta.matchMode as any,
    fieldGetFunction: closureFieldGetFunction,
    columnDefintion: param.columnDefintion,
    matchFunction: matchFunction,
    isFromGlobal: isFromGlobal,
  };
  param.result.push(entry);
}

function addCIValueFilter<Type extends TransformedAttendeeInfo>(
  param: AddFilterInterface<Type>,
  fieldName: string,
  isFromGlobal: boolean,
  filterMeta: DataTableFilterMetaData
): void {
  const filterValue: string | null =
    parseStringFromDataTableFilterMetaDataCI(filterMeta);
  if (filterValue === null) {
    return;
  }
  const closureMatchFunction: MatchStringAgainstValue =
    getMatcherStringAgainstValue(filterMeta);
  const closureFieldGetFunction: ValueGetter<Type> = getFieldGetFunction(
    param.fieldResolvers,
    fieldName
  );
  const matchFunction: PreparedMatchFunction<Type> = (item: Type): boolean => {
    const rawDataValue: string = <string>closureFieldGetFunction(item);
    const dataValue: string = rawDataValue.toLowerCase();
    return closureMatchFunction(dataValue, filterValue);
  };
  const entry: FilterFunctorContainer<Type> = {
    filterValue: filterValue,
    matchModeString: filterMeta.matchMode as any,
    fieldGetFunction: closureFieldGetFunction,
    columnDefintion: param.columnDefintion,
    matchFunction: matchFunction,
    isFromGlobal: isFromGlobal,
  };
  param.result.push(entry);
}

function parseListFromDataTableFilterMetaData(
  filterMeta: DataTableFilterMetaData
): string[] | null {
  if (filterMeta.value === null || filterMeta.matchMode === undefined) {
    return null;
  }
  const filterValue: string[] = filterMeta.value;
  if (filterValue.length === 0) {
    return null;
  }
  return filterValue;
}

function addListFilter<Type extends TransformedAttendeeInfo>(
  param: AddFilterInterface<Type>,
  fieldName: string,
  isFromGlobal: boolean,
  filterMeta: DataTableFilterMetaData
): void {
  const filterValue: string[] | null =
    parseListFromDataTableFilterMetaData(filterMeta);
  if (filterValue === null) {
    return;
  }
  const closureMatchFunction: MatchStringAgainstList =
    getMatcherStringAgainstList(filterMeta);
  const closureFieldGetFunction: ValueGetter<Type> = getFieldGetFunction(
    param.fieldResolvers,
    fieldName
  );
  const matchFunction: PreparedMatchFunction<Type> = (item: Type): boolean => {
    const dataValue: string = closureFieldGetFunction(item) as string;
    return closureMatchFunction(dataValue, filterValue);
  };
  const entry: FilterFunctorContainer<Type> = {
    filterValue: filterValue,
    matchModeString: filterMeta.matchMode as any,
    fieldGetFunction: closureFieldGetFunction,
    columnDefintion: param.columnDefintion,
    matchFunction: matchFunction,
    isFromGlobal: isFromGlobal,
  };
  param.result.push(entry);
}

export function getFilterFunctorContainerList<
  Type extends TransformedAttendeeInfo
>(
  filter: RawAttendeeFilter,
  globalFilterColumns: FilterFieldValue[]
): FilterFunctorContainer<Type>[] {
  var result: FilterFunctorContainer<Type>[] = [];
  const fieldGet: {
    [key: string]: ValueGetter<Type>;
  } = getFieldGetters();

  const isGlobalFilterActive: boolean =
    (filter.global.value || "").trim().length > 0;

  setupColumnDefinitionList.forEach((columnDefintion: ColumnDefinition) => {
    const cmpType: FilterCmpTypeValue | undefined =
      columnDefintion.filterConfig?.cmpType;
    const fieldName: FilterFieldValue =
      columnDefintion.value as FilterFieldValue;
    const filterKey: FilterFieldValue =
      columnDefintion.value as FilterFieldValue;
    const isActiveGlobalColumn: boolean =
      isGlobalFilterActive &&
      (columnDefintion.filterConfig?.canBeGlobalFilter || false) &&
      globalFilterColumns.includes(fieldName);
    const params: AddFilterInterface<Type> = {
      result: result,
      fieldResolvers: fieldGet,
      columnDefintion: columnDefintion,
    };
    // Add full name filter if both first and last name are selected
    if (
      fieldName == "transFullName" &&
      globalFilterColumns.includes("first_name") &&
      globalFilterColumns.includes("last_name")
    ) {
      addCIValueFilter(params, fieldName, true, filter.global);
    }
    // Add standard filters
    if (cmpType === FilterCmpType.number) {
      // Normal string vs string comparison within one field
      addNumberValueFilter(params, fieldName, false, filter[filterKey]);
    }
    if (cmpType === FilterCmpType.number && isActiveGlobalColumn) {
      // Normal string vs string comparison based on the global search
      addNumberValueFilter(params, fieldName, true, filter.global);
    }
    if (cmpType === FilterCmpType.ci_str_vs_str) {
      // Normal string vs string comparison within one field
      addCIValueFilter(params, fieldName, false, filter[filterKey]);
    }
    if (cmpType === FilterCmpType.ci_str_vs_str && isActiveGlobalColumn) {
      // Normal string vs string comparison based on the global search
      addCIValueFilter(params, fieldName, true, filter.global);
    }
    if (cmpType === FilterCmpType.str_vs_list) {
      // Normal string vs list comparison within one field
      addListFilter(params, fieldName, false, filter[filterKey]);
    }
    /*
    Probably no use case for this...
    if (cmpType === FilterCmpType.str_vs_list && isActiveGlobalColumn) {
      // Convert global value into something the list matcher expects
      addListFilter(result, fieldGet, columnDefintion, fieldName, {
        value: filter.global.value.trim().toLowerCase(),
        matchMode: filter.global.matchMode,
      });
    }
      */
    // Add special filters
    if (cmpType === FilterCmpType.country) {
      // Compare against list in country field
      addListFilter(params, "country", false, filter.country);
    }
    if (cmpType === FilterCmpType.country && isActiveGlobalColumn) {
      // Compare global search against country name
      addCIValueFilter(params, "transCountryName", true, filter.global);
    }
    if (cmpType === FilterCmpType.birthday) {
      // Compare birthday within the field
      addValueFilter(params, "transBirthday", false, {
        value: getBirthdayFilterString(filter.birthday.value || ""),
        matchMode: "startsWith",
      });
    }
    if (cmpType === FilterCmpType.birthday && isActiveGlobalColumn) {
      // Compare birthday from the global search
      addValueFilter(params, "transBirthday", true, {
        value: getBirthdayFilterString(filter.global.value || ""),
        matchMode: "startsWith",
      });
    }
  });
  return result;
}
