import type {
  AllFilterFieldValues,
  CustomFilterMetaData,
  RawAttendeeFilter,
} from "@/types/internal/filter";
import { setupColumnDefinitionList } from "@/config/system/regdesk";
import type { ColumnDefinition } from "@/types/internal/component/table";

export function getActiveFilters(
  dataFilter: RawAttendeeFilter
): CustomFilterMetaData[] {
  function lookupColumnDefinition(
    fieldName: AllFilterFieldValues
  ): ColumnDefinition {
    const result: ColumnDefinition | undefined = setupColumnDefinitionList.find(
      (value: ColumnDefinition) => value.fieldName == fieldName
    );
    if (result !== undefined) {
      return result;
    }
    throw new Error(`Invalid column definition or filter configuration!`);
  }

  return Object.entries(dataFilter)
    .filter(([_filterField, filterItem]) => {
      filterItem.value !== null &&
        filterItem.value !== "" &&
        filterItem.value?.length !== 0;
    })
    .map(([filterField, filterItem]) => {
      const newFieldName: AllFilterFieldValues =
        filterField as AllFilterFieldValues;
      return {
        ...filterItem,
        ...lookupColumnDefinition(newFieldName),
        ...{ fieldName: newFieldName },
      };
    });
}
