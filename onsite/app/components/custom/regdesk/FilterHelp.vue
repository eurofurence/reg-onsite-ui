<template>
  <div v-if="!hasMinimalFilter(props.dataOptions.filters)">
    <CustomRegdeskSearchMessage
      :severity="Severity.info"
      title="Please enter search criteria!"
    >
      <ul>
        <li>
          {{ getBadgeInputHelp() }}
        </li>
        <li>
          {{ getNameInputHelp() }}
        </li>
      </ul>
    </CustomRegdeskSearchMessage>
    <CustomRegdeskSearchMessage
      v-if="props.dataOptions.globalFilterFields.length > 0"
      :severity="Severity.info"
      title="Use the 'Global Search' to search for"
    >
      <ul>
        <li v-if="props.dataOptions.globalFilterFields.includes('badge_id')">
          'Badge ID' with or without the checksum letter
        </li>
        <li v-if="getGlobalFilterNameItems().length > 0">
          {{ getGlobalNameFilterFieldsHelp() }}
        </li>
        <li v-if="props.dataOptions.globalFilterFields.includes('birthday')">
          'Birthday' using the yyyy-mm-dd format and entering at least 'yyyy-'
        </li>
      </ul>
    </CustomRegdeskSearchMessage>
    <CustomRegdeskSearchMessage
      :severity="Severity.info"
      title="Auto-Selection of attendees is done when"
      v-if="props.displayOptions.filterAutoSelect"
    >
      <ul class="search-help-list">
        <li>the filtered search result contains only a single attendee,</li>
        <li v-if="props.dataOptions.globalFilterFields.includes('badge_id')">
          and the global filter is not a number,
        </li>
        <li>
          and the user was not previously selected by the Auto-Selection
          mechanism.
        </li>
      </ul>
    </CustomRegdeskSearchMessage>
    <CustomRegdeskSearchMessage
      :severity="Severity.warn"
      title=""
      v-else-if="hasActiveFilter(props.dataOptions.filters)"
    >
      <div v-if="props.dataOptions.queryMode !== AttendeeQueryStrategy.manual">
        No attendees are matching the current filters!
        <pre>{{ getFilterText(props.dataOptions.filters) }}</pre>
      </div>
      <div v-else>
        Please press the search button to search for:
        <pre>{{ getFilterText(props.dataOptions.filters) }}</pre>
      </div>
    </CustomRegdeskSearchMessage>
    <CustomRegdeskSearchMessage :severity="Severity.warn" title="" v-else>
      No attendees were retrieved from the database!
    </CustomRegdeskSearchMessage>
  </div>
</template>

<script setup lang="ts">
import { getActiveFilters } from "@/composables/sort_and_filter/getActiveFilters";
import { setupColumnDefinitionList } from "@/config/regdesk";
import {
  Severity,
  type AttendeeDataOptions,
  type RawAttendeeFilter,
  type AttendeeTableDisplayOptions,
  type ColumnDefinition,
  type FilterFieldValue,
  AttendeeQueryStrategy,
} from "@/types/internal";
import { hasMinimalFilter } from "@/composables/sort_and_filter/hasMinimalFilter";

function getFilterText(dataFilter: RawAttendeeFilter) {
  return dataFilter;
}

function hasActiveFilter(dataFilter: RawAttendeeFilter): boolean {
  return getActiveFilters(dataFilter).length > 0;
}

function getBadgeInputHelp(): string {
  const isBadgeIdInGlobalFilter: boolean =
    props.dataOptions.globalFilterFields.includes("badge_id");
  return `Enter some number in the ${
    isBadgeIdInGlobalFilter ? "global or " : ""
  }'Badge ID' search field`;
}

function getGlobalFilterNameItems(): ColumnDefinition[] {
  const nameFilterFieldList: FilterFieldValue[] = [
    "nickname",
    "first_name",
    "last_name",
  ];
  return setupColumnDefinitionList.filter((item: ColumnDefinition) => {
    const isNameField: boolean = nameFilterFieldList.some(
      (field: FilterFieldValue) => field == item.fieldName
    );
    const isInActiveGlobalFilters = props.dataOptions.globalFilterFields.some(
      (field: FilterFieldValue) => field == item.fieldName
    );
    return isNameField && isInActiveGlobalFilters;
  });
}

function getNameInputHelp(): string {
  const hasNameFieldInGlobalFilter: boolean =
    getGlobalFilterNameItems().length > 0;
  return `Enter at least two characters in ${
    hasNameFieldInGlobalFilter ? "the global or " : ""
  }any of the column search fields`;
}

function getGlobalNameFilterFieldsHelp(): string {
  const nameFilterFieldsString = getGlobalFilterNameItems()
    .map((item: ColumnDefinition) => `'${item.label}'`)
    .join(", ");
  const hasFirstAndLastNameInGlobalFilter =
    props.dataOptions.globalFilterFields.includes("first_name") &&
    props.dataOptions.globalFilterFields.includes("last_name");
  return (
    (hasFirstAndLastNameInGlobalFilter
      ? `${nameFilterFieldsString}, or the 'Full Name' `
      : nameFilterFieldsString) + "that is non-numeric"
  );
}

interface Props {
  dataOptions: AttendeeDataOptions;
  displayOptions: AttendeeTableDisplayOptions;
}
const props: Props = defineProps<Props>();
</script>
