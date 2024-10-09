import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type { FilterCmpTypeValue } from "@/types/internal/filter";
import type { OptionalColoredIconLabeledValue } from "@/types/internal/infos";

export interface FilterElementProps {
  filterCallback: CallableFunction;
  columnDefinition: ColumnDefinition | null;
}

export interface ColumnDefinition {
  fieldName: keyof TransformedAttendeeInfo;
  label: string;
  columnComponentType?: "country" | "birthday" | "tag" | "checkin" | "dues";
  filterComponentType?: "standard" | "country" | "birthday" | "tag";
  filterType?: FilterCmpTypeValue;
  filterMinLength?: number;
  filterSufficientForQuery: boolean;
  fieldCanBeUsedByGlobalSearch?: boolean;
  showFilterMenu?: boolean;
  sortEnabled?: boolean;
  dataType?: "numeric" | "date";
  configItems?: OptionalColoredIconLabeledValue<string>[];
  maxLength?: number;
}

export const enum TableFilterDisplay {
  menu = "menu",
  row = "row",
}

export type TableFilterDisplayValue = `${TableFilterDisplay}`;
