import { FilterMatchMode } from "@primevue/core/api";
import { metadataListForConBookChoice } from "@/config/metadata/flags/metadataForConBookChoice";
import { metadataListForConRoles } from "@/config/metadata/flags/metadataForConRoles";
import { metadataListForSponsorLevels } from "@/config/metadata/packages/metadataForSponsorLevels";
import { metadataListForStatus } from "@/config/metadata/metadataForStatus";
import type { DataTableFilterMetaData } from "primevue/datatable";
import { deepCopy } from "@/composables/deepCopy";
import {
  AttendeeQueryStrategy,
  CheckinDisplay,
  type AttendeeDataOptions,
  type AttendeeQueryStrategyValue,
  type AttendeeTableDisplayOptions,
  type CheckinDisplayValue,
} from "@/types/internal/system/regdesk";
import {
  TableFilterDisplay,
  type ColumnDefinition,
  type TableFilterDisplayValue,
} from "@/types/internal/component/table";
import type { LabeledValue } from "@/types/internal/infos";
import { FilterCmpType } from "@/types/internal/filter";
import { AttendeeApiStatus } from "@/config/metadata/metadataForStatus";

export const defaultAttendeeTableDisplayOptions: AttendeeTableDisplayOptions = {
  displayRowsPerPage: 10,
  filterAutoSelect: true,
  checkinAutoClose: true,
  displayRunner: {
    enabled: true,
    location: "top-right",
    size: 12,
    duration: 10 * 1000,
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
    label: "Below Search Results",
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
    filterType: FilterCmpType.ci_str_vs_str,
    filterSufficientForQuery: true,
    sortEnabled: true,
    showFilterMenu: false,
  },
  {
    fieldName: "nickname",
    label: "Nickname",
    maxLength: 40,
    filterComponentType: "standard",
    fieldCanBeUsedByGlobalSearch: true,
    filterType: FilterCmpType.ci_str_vs_str,
    filterMinLength: 2,
    filterSufficientForQuery: true,
    sortEnabled: true,
  },
  {
    fieldName: "transFullName",
    label: "Full Name",
    maxLength: 40,
    filterComponentType: "standard",
    fieldCanBeUsedByGlobalSearch: false,
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
    columnComponentType: "tag",
    filterComponentType: "tag",
    filterType: FilterCmpType.str_vs_list,
    filterSufficientForQuery: false,
    configItems: metadataListForStatus,
    sortEnabled: true,
    showFilterMenu: false,
  },
  {
    fieldName: "transConbookChoice",
    label: "Conbook",
    columnComponentType: "tag",
    filterComponentType: "tag",
    filterType: FilterCmpType.str_vs_list,
    configItems: metadataListForConBookChoice,
    filterSufficientForQuery: false,
    sortEnabled: true,
    showFilterMenu: false,
  },
  {
    fieldName: "transSponsorChoice",
    label: "Sponsor",
    columnComponentType: "tag",
    filterComponentType: "tag",
    filterType: FilterCmpType.str_vs_list,
    filterSufficientForQuery: false,
    configItems: metadataListForSponsorLevels,
    sortEnabled: true,
    showFilterMenu: false,
  },
  {
    fieldName: "transConRole",
    label: "Role",
    columnComponentType: "tag",
    filterComponentType: "tag",
    filterType: FilterCmpType.str_vs_list,
    filterSufficientForQuery: false,
    configItems: metadataListForConRoles,
    sortEnabled: true,
    showFilterMenu: false,
  },
  {
    fieldName: "transCanCheckin",
    label: "Checkin",
    columnComponentType: "checkin",
    filterSufficientForQuery: false,
    sortEnabled: false,
  },
  {
    fieldName: "current_dues",
    label: "Dues",
    columnComponentType: "dues",
    filterSufficientForQuery: false,
    sortEnabled: true,
  },
];

const filterMetadata: DataTableFilterMetaData = {
  value: "",
  matchMode: FilterMatchMode.CONTAINS,
};

const filterIdMetadata: DataTableFilterMetaData = {
  value: "",
  matchMode: FilterMatchMode.STARTS_WITH,
};

const filterListMetadata: DataTableFilterMetaData = {
  value: [],
  matchMode: FilterMatchMode.IN,
};

export const defaultAttendeeDataOptions: AttendeeDataOptions = {
  filterConfig: {
    filterValues: deepCopy({
      global: filterMetadata,
      badge_id: filterIdMetadata,
      nickname: filterMetadata,
      first_name: filterMetadata,
      last_name: filterMetadata,
      country: filterListMetadata,
      birthday: filterMetadata,
      status: {
        value: [
          AttendeeApiStatus.approved,
          AttendeeApiStatus.partially_paid,
          AttendeeApiStatus.paid,
        ],
        matchMode: FilterMatchMode.IN,
      },
      transConbookChoice: filterListMetadata,
      transSponsorChoice: filterListMetadata,
      transConRole: filterListMetadata,
      transCanCheckin: filterMetadata,
      transFullName: filterMetadata,
      current_dues: filterMetadata,
    }),
    globalFilterFields: [
      "badge_id",
      "nickname",
      "first_name",
      "last_name",
      "birthday",
    ],
  },
  queryMode: AttendeeQueryStrategy.preload,
  totalRecords: 0,
  cachedRecords: null,
  loading: false,
  sortOrder: [],
};
