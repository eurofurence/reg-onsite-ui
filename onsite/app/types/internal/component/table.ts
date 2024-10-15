import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type { FilterCmpTypeValue } from "@/types/internal/filter";
import type {
  LabeledValue,
  OptionalColoredIconLabeledValue,
} from "@/types/internal/infos";

export interface FilterElementProps {
  filterCallback: CallableFunction;
  columnDefinition: ColumnDefinition | null;
}

export const enum ColumnType {
  standard,
  country,
  birthday,
  tag,
  checkin,
  dues,
}

export interface ColumnFilterConfig {
  canBeGlobalFilter: boolean;
  canChangeMatcher: boolean;
  cmpType: FilterCmpTypeValue;
  dataTypeForMenu?: "text" | "date" | "numeric";
  isPersistent: boolean;
  isSufficientForQuery: boolean;
  minLength?: number;
}

interface GenericColumn extends LabeledValue<keyof TransformedAttendeeInfo> {
  sortEnabled: boolean;
  filterConfig?: ColumnFilterConfig;
  dataType?: "numeric" | "date";
}

interface StandardColumn extends GenericColumn {
  columnType: ColumnType.standard;
  maxLength: number;
}

interface CountryColumn extends GenericColumn {
  columnType: ColumnType.country;
}

interface BirthdayColumn extends GenericColumn {
  columnType: ColumnType.birthday;
}

interface TagColumn extends GenericColumn {
  columnType: ColumnType.tag;
  configItems: OptionalColoredIconLabeledValue<string>[];
}

interface CheckinColumn extends GenericColumn {
  columnType: ColumnType.checkin;
}

interface DuesColumn extends GenericColumn {
  columnType: ColumnType.dues;
}

export type ColumnDefinition =
  | StandardColumn
  | CountryColumn
  | BirthdayColumn
  | TagColumn
  | CheckinColumn
  | DuesColumn;

export const enum TableFilterDisplay {
  menu = "menu",
  row = "row",
}

export type TableFilterDisplayValue = `${TableFilterDisplay}`;
