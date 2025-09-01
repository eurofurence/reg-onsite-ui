<template>
  <div class="flex flex-col items-center">
    <div>
      <div v-if="!hasRequiredFilter() && props.displayFilterHelp">
        <SearchMessage
          :severity="MessageSeverity.info"
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
        </SearchMessage>
        <SearchMessage
          v-if="props.dataOptions.filterConfig.globalFilterFields.length > 0"
          :severity="MessageSeverity.info"
          title="Use the 'Global Search' to search for"
        >
          <ul>
            <li v-if="hasGlobalFilterType('badge_id')">
              'Badge ID' with or without the checksum letter
            </li>
            <li v-if="getGlobalFilterNameItems().length > 0">
              {{ getGlobalNameFilterFieldsHelp() }}
            </li>
            <li v-if="hasGlobalFilterType('birthday')">
              'Birthday' using the yyyy-mm-dd format and entering at least
              'yyyy-'
            </li>
          </ul>
        </SearchMessage>
        <SearchMessage
          :severity="MessageSeverity.info"
          title="Auto-Selection of attendees is done when"
          v-if="props.displayOptions.filterAutoSelect"
        >
          <ul class="search-help-list">
            <li>the filtered search result contains only a single attendee,</li>
            <li v-if="hasGlobalFilterType('badge_id')">
              and the global filter is not a number,
            </li>
            <li>
              and the user was not previously selected by the Auto-Selection
              mechanism.
            </li>
          </ul>
        </SearchMessage>
      </div>

      <SearchMessage
        :severity="MessageSeverity.warn"
        title="Filter Overview"
        v-if="noSearchResults && hasActiveFilter() && props.displayFilterSummary"
      >
        <div
          v-if="props.dataOptions.queryMode !== AttendeeQueryStrategy.manual"
        >
          <span v-if="!hasRequiredFilter()"
            >The filters are not specific enough. Please add more filters.</span
          >
          <span v-else>No attendees are matching the current filters!</span>
          <pre>{{ getFilterText(getActiveFilterList()) }}</pre>
        </div>
        <div v-else>
          Please press the search button to search for:
          <pre>{{ getFilterText(getActiveFilterList()) }}</pre>
        </div>
      </SearchMessage>
      <SearchMessage
        :severity="MessageSeverity.warn"
        title="No attendees were retrieved from the database!"
        v-if="noResults"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import SearchMessage from "@/components/regdesk/SearchMessage.vue";
import {
  getFilterFunctorContainerList,
  type FilterFunctorContainer,
} from "@/composables/sort_and_filter/getFilterFunctorContainerList";
import { getFilterText } from "@/composables/sort_and_filter/getFilterText";
import { hasMinimalFilter } from "@/composables/sort_and_filter/hasMinimalFilter";
import { setupColumnDefinitionList } from "@/config/system/regdesk";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type { ColumnDefinition } from "@/types/internal/component/table";
import type { FilterFieldValue } from "@/types/internal/filter";
import { MessageSeverity } from "@/types/internal/primevue";
import {
  AttendeeQueryStrategy,
  type AttendeeDataOptions,
  type AttendeeTableDisplayOptions,
} from "@/types/internal/system/regdesk";

function getActiveFilterList(): FilterFunctorContainer<TransformedAttendeeInfo>[] {
  return getFilterFunctorContainerList(
    props.dataOptions.filterConfig.filterValues,
    props.dataOptions.filterConfig.globalFilterFields
  );
}

function hasRequiredFilter(): boolean {
  return hasMinimalFilter(props.dataOptions.filterConfig.filterValues);
}

function hasActiveFilter(): boolean {
  return getActiveFilterList().length > 0;
}

function hasGlobalFilterType(value: FilterFieldValue) {
  return props.dataOptions.filterConfig.globalFilterFields.includes(value);
}

function getBadgeInputHelp(): string {
  const isBadgeIdInGlobalFilter: boolean =
    props.dataOptions.filterConfig.globalFilterFields.includes("badge_id");
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
      (field: FilterFieldValue) => field == item.value
    );
    const isInActiveGlobalFilters =
      props.dataOptions.filterConfig.globalFilterFields.some(
        (field: FilterFieldValue) => field == item.value
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
    hasGlobalFilterType("first_name") && hasGlobalFilterType("last_name");
  return (
    (hasFirstAndLastNameInGlobalFilter
      ? `${nameFilterFieldsString}, or the 'Full Name' `
      : nameFilterFieldsString) + "that is non-numeric"
  );
}

interface Props {
  dataOptions: AttendeeDataOptions;
  displayOptions: AttendeeTableDisplayOptions;
  noResults: boolean;
  noSearchResults: boolean;
  displayFilterHelp: boolean;
  displayFilterSummary: boolean;
}
const props: Props = defineProps<Props>();
</script>
