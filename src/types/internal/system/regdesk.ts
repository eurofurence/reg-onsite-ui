import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type { DurationInMS } from "@/types/internal/common";
import type { TableFilterDisplayValue } from "@/types/internal/component/table";
import type { FilterConfig } from "@/types/internal/filter";
import type { FontSize } from "@/types/internal/system/theme";
import type { DataTableSortMeta } from "primevue/datatable";
import type { ToastProps } from "primevue/toast";

export const enum AttendeeQueryStrategy {
  manual = "manual",
  preload = "preload",
  ondemand = "ondemand",
}

export type AttendeeQueryStrategyValue = `${AttendeeQueryStrategy}`;

export const enum CheckinDisplay {
  dialog = "dialog",
  below = "below",
  above = "above",
}

export type CheckinDisplayValue = `${CheckinDisplay}`;

export interface AttendeeDataOptions {
  queryMode: AttendeeQueryStrategyValue;
  cachedRecords: number | null;
  totalRecords: number;
  loading: boolean;
  sortOrder: DataTableSortMeta[];
  filterConfig: FilterConfig;
}

export interface AttendeeTableDisplayOptions {
  displayCheckinLocation: CheckinDisplayValue;
  displayFilterHelp: boolean;
  displayFilterSummary: boolean;
  displayColumns: (keyof TransformedAttendeeInfo)[];
  displayRowsPerPage: number;
  checkinAutoClose: boolean;
  checkinAutoResetFilter: boolean;
  filterAutoSelect: boolean;
  filterInputDisplay: TableFilterDisplayValue;
  displayRunner: {
    enabled: boolean;
    location: ToastProps["position"];
    size: FontSize;
    duration: DurationInMS;
  };
}
