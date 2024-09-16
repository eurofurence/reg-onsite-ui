import type {
  ColumnDefinition,
  FilterFieldValue,
  RawAttendeeFilter,
  TransformedAttendeeInfo,
  ValueGetter,
} from "@/types/internal";
import {
  getEffectiveGlobalFilter,
  type EffectiveGlobalFilter,
} from "@/composables/sort_and_filter/getEffectiveGlobalFilter";
import { getFilterDecisionForColumn } from "@/composables/sort_and_filter/old_approach/getFilterDecisionForColumn";

function splitLastOccurrence(str: string, substring: string): [string, string] {
  const lastIndex = str.lastIndexOf(substring);
  const before = str.slice(0, lastIndex);
  const after = str.slice(lastIndex + 1);
  return [before, after];
}

export function getFilteredAttendees<Type extends TransformedAttendeeInfo>(
  unsortedList: Type[],
  filter: RawAttendeeFilter,
  globalFilterColumns: FilterFieldValue[]
): Type[] {
  const effectiveGlobalFilter: EffectiveGlobalFilter = getEffectiveGlobalFilter(
    filter,
    globalFilterColumns
  );

  function filterAttendee(item: Type): boolean {
    let localMatch: boolean = true;
    for (const filterFieldRaw in filter) {
      if (
        filterFieldRaw == "transCanCheckin" ||
        filterFieldRaw === "current_dues"
      ) {
        continue;
      }
      const filterField: keyof RawAttendeeFilter = <keyof RawAttendeeFilter>(
        filterFieldRaw
      );
      if (filterField !== "global") {
        localMatch = getFilterDecisionForColumn(
          item,
          filterField,
          filter[filterField]
        );
        if (!localMatch) {
          break;
        }
      }
    }

    if (effectiveGlobalFilter.filterColumns.length === 0) {
      return localMatch;
    }

    if (
      effectiveGlobalFilter.globalFilter.value.indexOf(" ") >= 0 &&
      effectiveGlobalFilter.filterColumns.includes("first_name") &&
      effectiveGlobalFilter.filterColumns.includes("last_name")
    ) {
      const [globalFirstName, globalLastName]: [string, string] =
        splitLastOccurrence(
          effectiveGlobalFilter.globalFilter.value.trim(),
          " "
        );
      const firstNameMatches: boolean = getFilterDecisionForColumn(
        item,
        "first_name",
        {
          ...effectiveGlobalFilter.globalFilter,
          value: globalFirstName,
        }
      );
      const lastNameMatches: boolean = getFilterDecisionForColumn(
        item,
        "last_name",
        {
          ...effectiveGlobalFilter.globalFilter,
          value: globalLastName,
        }
      );
      if (firstNameMatches && lastNameMatches) {
        return localMatch;
      }
    }

    for (const globalFilterField of effectiveGlobalFilter.filterColumns) {
      const globalMatch: boolean = getFilterDecisionForColumn(
        item,
        globalFilterField,
        effectiveGlobalFilter.globalFilter
      );
      if (globalMatch) {
        return localMatch;
      }
    }
    return false;
  }

  return unsortedList.filter(filterAttendee);
}
