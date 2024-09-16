import { FilterMatchMode } from "@primevue/core/api";
import { setupConBookChoices } from "@/config/setupConBookChoices";
import { setupConRoles } from "@/config/setupConRoles";
import { setupSponsorLevels } from "@/config/setupSponsorLevels";
import { setupStatus } from "@/config/setupStatus";
import {
  AttendeeQueryStrategy,
  CheckinDisplay,
  FilterCmpType,
  TableFilterDisplay,
  type AttendeeDataOptions,
  type AttendeeQueryStrategyValue,
  type AttendeeTableDisplayOptions,
  type CheckinDisplayValue,
  type ColumnDefinition,
  type LabeledValue,
  type TableFilterDisplayValue,
} from "@/types/internal";
import type { DataTableFilterMetaData } from "primevue/datatable";
import { deepCopy } from "@/composables/state/deepCopy";

export const defaultAttendeeTableDisplayOptions: AttendeeTableDisplayOptions = {
  displayRowsPerPage: 10,
  filterAutoSelect: true,
  displayRunner: {
    enabled: true,
    location: "top-right",
    size: 12,
    duration: 7500,
  },
  displayCheckinLocation: CheckinDisplay.dialog,
  filterInputDisplay: TableFilterDisplay.row,
  displayColumns: [
    "badge_id",
    "nickname",
    "first_name",
    "last_name",
    "birthday",
    "status",
  ],
};

export const setupTableFilterDisplay: LabeledValue<TableFilterDisplayValue>[] =
  [
    {
      value: TableFilterDisplay.menu,
      label: "Search Menus",
    },
    {
      value: TableFilterDisplay.row,
      label: "Search Row",
    },
  ];

export const setupCheckinDisplay: LabeledValue<CheckinDisplayValue>[] = [
  {
    value: CheckinDisplay.dialog,
    label: "Modal Dialog",
  },
  {
    value: CheckinDisplay.above,
    label: "Above Search Results",
  },
  {
    value: CheckinDisplay.below,
    label: "Under Search Results",
  },
];

export const setupAttendeeQueryStrategy: LabeledValue<AttendeeQueryStrategyValue>[] =
  [
    {
      value: AttendeeQueryStrategy.preload,
      label: "Preload Data (enables Auto-Complete)",
    },
    {
      value: AttendeeQueryStrategy.ondemand,
      label: "Automatic Search (with Caching)",
    },
    {
      value: AttendeeQueryStrategy.manual,
      label: "Search Button (no Caching)",
    },
  ];

export const setupColumnDefinitionList: ColumnDefinition[] = [
  {
    fieldName: "badge_id",
    label: "Badge ID",
    maxLength: 40,
    filterComponentType: "standard",
    fieldCanBeUsedByGlobalSearch: true,
    filterType: FilterCmpType.number,
    filterSufficientForQuery: true,
    sortEnabled: true,
    showFilterMenu: false,
  },
  {
    fieldName: "nickname",
    label: "Nickame",
    maxLength: 40,
    filterComponentType: "standard",
    fieldCanBeUsedByGlobalSearch: true,
    filterType: FilterCmpType.ci_str_vs_str,
    filterMinLength: 2,
    filterSufficientForQuery: true,
    sortEnabled: true,
  },
  {
    fieldName: "first_name",
    label: "First Name",
    maxLength: 40,
    filterComponentType: "standard",
    fieldCanBeUsedByGlobalSearch: true,
    filterType: FilterCmpType.ci_str_vs_str,
    filterMinLength: 2,
    filterSufficientForQuery: true,
    sortEnabled: true,
  },
  {
    fieldName: "last_name",
    label: "Last Name",
    maxLength: 40,
    filterComponentType: "standard",
    fieldCanBeUsedByGlobalSearch: true,
    filterType: FilterCmpType.ci_str_vs_str,
    filterMinLength: 2,
    filterSufficientForQuery: true,
    sortEnabled: true,
  },
  {
    fieldName: "country",
    label: "Nationality",
    maxLength: 40,
    columnComponentType: "country",
    filterComponentType: "country",
    filterType: FilterCmpType.country,
    filterSufficientForQuery: false,
    sortEnabled: true,
    showFilterMenu: false,
  },
  {
    fieldName: "birthday",
    label: "Birthday",
    columnComponentType: "birthday",
    filterComponentType: "birthday",
    fieldCanBeUsedByGlobalSearch: true,
    filterType: FilterCmpType.birthday,
    filterSufficientForQuery: true,
    sortEnabled: true,
    dataType: "date",
    showFilterMenu: false,
  },
  {
    fieldName: "status",
    label: "Status",
    maxLength: 40,
    columnComponentType: "tag",
    filterComponentType: "tag",
    filterType: FilterCmpType.str_vs_list,
    filterSufficientForQuery: false,
    configItems: setupStatus,
    sortEnabled: true,
    showFilterMenu: false,
  },
  {
    fieldName: "transConbookChoice",
    label: "Conbook",
    maxLength: 40,
    columnComponentType: "tag",
    filterComponentType: "tag",
    filterType: FilterCmpType.str_vs_list,
    configItems: setupConBookChoices,
    filterSufficientForQuery: false,
    sortEnabled: true,
    showFilterMenu: false,
  },
  {
    fieldName: "transSponsorChoice",
    label: "Sponsor",
    maxLength: 40,
    columnComponentType: "tag",
    filterComponentType: "tag",
    filterType: FilterCmpType.str_vs_list,
    filterSufficientForQuery: false,
    configItems: setupSponsorLevels,
    sortEnabled: true,
    showFilterMenu: false,
  },
  {
    fieldName: "transConRole",
    label: "Role",
    maxLength: 40,
    columnComponentType: "tag",
    filterComponentType: "tag",
    filterType: FilterCmpType.str_vs_list,
    filterSufficientForQuery: false,
    configItems: setupConRoles,
    sortEnabled: true,
    showFilterMenu: false,
  },
  {
    fieldName: "transCanCheckin",
    label: "Checkin",
    maxLength: 40,
    columnComponentType: "checkin",
    filterSufficientForQuery: false,
    sortEnabled: false,
  },
  {
    fieldName: "current_dues",
    label: "Dues",
    maxLength: 40,
    columnComponentType: "dues",
    filterSufficientForQuery: false,
    sortEnabled: true,
  },
];

const filterMetadata: DataTableFilterMetaData = {
  value: "",
  matchMode: FilterMatchMode.STARTS_WITH,
};
const filterListMetadata: DataTableFilterMetaData = {
  value: [],
  matchMode: FilterMatchMode.CONTAINS,
};

export const defaultAttendeeDataOptions: AttendeeDataOptions = {
  filters: deepCopy({
    global: filterMetadata,
    badge_id: filterMetadata,
    nickname: filterMetadata,
    first_name: filterMetadata,
    last_name: filterMetadata,
    country: filterListMetadata,
    birthday: filterMetadata,
    status: filterListMetadata,
    transConbookChoice: filterListMetadata,
    transSponsorChoice: filterListMetadata,
    transConRole: filterListMetadata,
    transCanCheckin: filterMetadata,
    current_dues: filterMetadata,
  }),
  queryMode: AttendeeQueryStrategy.preload,
  totalRecords: 0,
  cachedRecords: null,
  loading: false,
  globalFilterFields: ["badge_id", "nickname", "first_name", "last_name"],
  sortOrder: [],
};
