import { deepCopy } from "@/composables/deepCopy";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import { AttendeeApiStatus } from "@/config/metadata/metadataForStatus";
import type { DurationInMS } from "@/types/internal/common";
import {
  ColumnType,
  TableFilterDisplay,
  type ColumnDefinition,
  type ColumnFilterConfig,
  type TableFilterDisplayValue,
} from "@/types/internal/component/table";
import { FilterCmpType, type RawAttendeeFilter } from "@/types/internal/filter";
import type { LabeledValue } from "@/types/internal/infos";
import {
  AttendeeQueryStrategy,
  CheckinDisplay,
  type AttendeeDataOptions,
  type AttendeeQueryStrategyValue,
  type AttendeeTableDisplayOptions,
  type CheckinDisplayValue,
} from "@/types/internal/system/regdesk";
import type { FontSize } from "@/types/internal/system/theme";
import { FilterMatchMode } from "@primevue/core/api";
import type { DataTableFilterMetaData } from "primevue/datatable";

export const defaultAttendeeTableDisplayOptions: AttendeeTableDisplayOptions = {
  displayRowsPerPage: 10,
  displayFilterHelp: true,
  displayFilterSummary: true,
  filterAutoSelect: true,
  checkinAutoClose: true,
  checkinAutoResetFilter: true,
  displayRunner: {
    enabled: true,
    location: "top-right",
    size: 12 as FontSize,
    duration: (10 * 1000) as DurationInMS,
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

const nameFilterConfig: ColumnFilterConfig = {
  canBeGlobalFilter: true,
  canChangeMatcher: false,
  cmpType: FilterCmpType.ci_str_vs_str,
  isPersistent: false,
  isSufficientForQuery: true,
  minLength: 2,
};

export const setupColumnDefinitionList: ColumnDefinition[] = [
  {
    value: "badge_id",
    label: "Badge ID",
    columnType: ColumnType.standard,
    maxLength: 40,
    sortEnabled: true,
    filterConfig: {
      canBeGlobalFilter: true,
      canChangeMatcher: false,
      cmpType: FilterCmpType.ci_str_vs_str,
      isPersistent: false,
      isSufficientForQuery: true,
      minLength: 0,
    },
  },
  {
    value: "nickname",
    label: "Nickname",
    columnType: ColumnType.standard,
    maxLength: 40,
    sortEnabled: true,
    filterConfig: nameFilterConfig,
  },
  {
    value: "transFullName",
    label: "Full Name",
    columnType: ColumnType.standard,
    maxLength: 40,
    sortEnabled: true,
    filterConfig: { ...nameFilterConfig, ...{ canBeGlobalFilter: false } },
  },
  {
    value: "first_name",
    label: "First Name",
    columnType: ColumnType.standard,
    maxLength: 40,
    sortEnabled: true,
    filterConfig: nameFilterConfig,
  },
  {
    value: "last_name",
    label: "Last Name",
    columnType: ColumnType.standard,
    maxLength: 40,
    sortEnabled: true,
    filterConfig: nameFilterConfig,
  },
  {
    value: "country",
    label: "Nationality",
    sortEnabled: true,
    columnType: ColumnType.country,
    filterConfig: {
      canBeGlobalFilter: false,
      canChangeMatcher: false,
      cmpType: FilterCmpType.country,
      isPersistent: false,
      isSufficientForQuery: false,
      minLength: 2,
    },
  },
  {
    value: "birthday",
    label: "Birthday",
    sortEnabled: true,
    columnType: ColumnType.birthday,
    filterConfig: {
      canBeGlobalFilter: true,
      canChangeMatcher: false,
      cmpType: FilterCmpType.birthday,
      dataTypeForMenu: "date",
      isPersistent: false,
      isSufficientForQuery: true,
      minLength: 4,
    },
  },
  {
    value: "status",
    label: "Status",
    sortEnabled: true,
    columnType: ColumnType.tag,
    configItems: getConventionSetup().metadata.forStatus.list,
    filterConfig: {
      canBeGlobalFilter: false,
      canChangeMatcher: false,
      cmpType: FilterCmpType.str_vs_list,
      isPersistent: true,
      isSufficientForQuery: false,
    },
  },
  {
    value: "transConbookChoice",
    label: "Conbook",
    sortEnabled: true,
    columnType: ColumnType.tag,
    configItems: getConventionSetup().metadata.forConBook.list,
    filterConfig: {
      canBeGlobalFilter: false,
      canChangeMatcher: false,
      cmpType: FilterCmpType.str_vs_list,
      isPersistent: true,
      isSufficientForQuery: false,
    },
  },
  {
    value: "transSponsorChoice",
    label: "Sponsor",
    sortEnabled: true,
    columnType: ColumnType.tag,
    configItems: getConventionSetup().metadata.forSponsorLevels.list,
    filterConfig: {
      canBeGlobalFilter: false,
      canChangeMatcher: false,
      cmpType: FilterCmpType.str_vs_list,
      isPersistent: true,
      isSufficientForQuery: false,
    },
  },
  {
    value: "transConRole",
    label: "Role",
    sortEnabled: true,
    columnType: ColumnType.tag,
    configItems: getConventionSetup().metadata.forConRole.list,
    filterConfig: {
      canBeGlobalFilter: false,
      canChangeMatcher: false,
      cmpType: FilterCmpType.str_vs_list,
      isPersistent: true,
      isSufficientForQuery: false,
    },
  },
  {
    value: "transCanCheckin",
    label: "Checkin",
    columnType: ColumnType.checkin,
    sortEnabled: false,
  },
  {
    value: "current_dues",
    label: "Dues",
    columnType: ColumnType.dues,
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

export function getDefaultAttendeeFilterValues(): RawAttendeeFilter {
  return deepCopy({
    global: filterMetadata,
    badge_id: filterIdMetadata,
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
    transFullName: filterMetadata,
    current_dues: filterMetadata,
  });
}

export const defaultAttendeeDataOptions: AttendeeDataOptions = {
  filterConfig: {
    filterValues: {
      ...getDefaultAttendeeFilterValues(),
      ...{
        status: {
          value: [
            AttendeeApiStatus.approved,
            AttendeeApiStatus.partially_paid,
            AttendeeApiStatus.paid,
          ],
          matchMode: FilterMatchMode.IN,
        },
      },
    },
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
