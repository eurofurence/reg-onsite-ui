import type { DataTableFilterMetaData } from "primevue/datatable";
import type { ColumnDefinition } from "@/types/internal/component/table";

export type FilterFieldValue =
  | "badge_id"
  | "nickname"
  | "first_name"
  | "last_name"
  | "country"
  | "birthday"
  | "status"
  | "transConbookChoice"
  | "transSponsorChoice"
  | "transConRole"
  | "transFullName";

export type AllFilterFieldValues = "global" | FilterFieldValue;

export type RawAttendeeFilter = Record<
  AllFilterFieldValues,
  DataTableFilterMetaData
>;

export interface FilterConfig {
  filterValues: RawAttendeeFilter;
  globalFilterFields: FilterFieldValue[];
}

export interface MatchStringAgainstList {
  (dataValue: string, filterValue: string[]): boolean;
}

export interface MatchStringAgainstValue {
  (dataValue: string, filterValue: string): boolean;
}

export interface MatchNumberAgainstValue {
  (dataValue: number, filterValue: number): boolean;
}

export const enum FilterCmpType {
  number = "number",
  ci_str_vs_str = "ci_str_vs_str",
  str_vs_list = "str_vs_list",
  country = "country",
  birthday = "birthday",
}

export type FilterCmpTypeValue = `${FilterCmpType}`;

export interface CustomFilterMetaData
  extends Omit<
    DataTableFilterMetaData & ColumnDefinition,
    "fieldName" | "value"
  > {
  fieldName: AllFilterFieldValues;
  value: null | string | string[];
}
