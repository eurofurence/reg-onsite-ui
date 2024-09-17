import type {
  ApiAttendeeInfo,
  ApiError,
  ApiSearchType,
  FlagApiValue,
  PackageApiValue,
} from "@/types/external";

import type {
  ConBookApiValue,
  ConBookValue,
} from "@/config/setupConBookChoices";
import type {
  GoodiesLevelValue,
  SponsorLevelValue,
} from "@/config/setupPackages";
import type { ConRoleApiValue, ConRoleValue } from "@/config/setupConRoles";
import type { StatusValues } from "@/config/setupStatus";
import type { ColorsPaletteValue } from "@/config/theme";
import type {
  AbstractTrinketWithVariantsValue,
  ConcreteTrinketValue,
} from "@/setupEFIteration";
import type {
  DataTableFilterMetaData,
  DataTableSortMeta,
} from "primevue/datatable";
import type { ToastProps } from "primevue/toast";

export type PackageValue = PackageApiValue | "";
export type FlagValue = FlagApiValue | "";

export const enum EnvName {
  dev = "dev",
  prod = "prod",
  prod_old = "prod_old",
}

export type EnvNameValue = `${EnvName}`;

export interface EnvironmentSettings {
  envName: EnvNameValue;
  apiBaseUrl: URL;
  dealerFrontdeskUrl: URL;
}

export const enum Severity {
  secondary = "secondary",
  info = "info",
  success = "success",
  warn = "warn",
  danger = "danger",
  contrast = "contrast",
  help = "help",
}

export type SeverityValue = `${Severity}`;

export interface RestErrorInfo {
  serviceName: string;
  errorCategory: string;
  errorDetail: string;
}

export interface UserThemeSettings {
  isDarkMode: boolean;
  fontSize: number;
  headerSize: number;
}

export type DefaultVariantValues = Map<
  AbstractTrinketWithVariantsValue,
  string | null
>;

export type DefaultSponsorDeskSettings = {};

export interface SponsorDeskSettings extends DefaultSponsorDeskSettings {
  available: ConcreteTrinketValue[]; // This property is dynamically created and not part of the hardcoded default
}

export interface RegNumSettings {
  maxRegNumber: number;
}

export type KeyMatchFunction = (key: string) => boolean;

export interface FetchResult<Type> {
  ok: boolean;
  status: number;
  data: Type | ApiError;
}

export type FetchResultPromise<Type> = Promise<FetchResult<Type>>;

export type KeyboardCallback = (event: KeyboardEvent) => Promise<any>;

export interface LabeledValue<ValueType> {
  value: ValueType;
  label: string;
  cssClass?: string;
}

export interface GenericTrinketConfig<
  ValueType,
  VariantType extends LabeledValue<VariantValueType>[] | null,
  VariantValueType extends string | null
> extends LabeledValue<ValueType> {
  variants?: VariantType;
}

interface TrinketConfigNode {
  value: string;
  label: string;
  variants?: LabeledValue<string>[] | null;
  issuedCount?: number;
  reservedCount?: number;
  reservedIssuedCount?: number;
  plannedCount?: number;
}

export interface TrinketTreeNode {
  key: ConcreteTrinketValue;
  data: TrinketConfigNode;
  children?: TrinketTreeNode[];
}

export interface ColoredLabeledValue<ValueType>
  extends LabeledValue<ValueType> {
  color: ColorsPaletteValue;
}

export interface OptionalColoredIconLabeledValue<ValueType>
  extends ColoredLabeledValue<ValueType> {
  icon?: string;
}

export interface ColoredIconLabeledValue<ValueType>
  extends ColoredLabeledValue<ValueType> {
  icon: string;
}

export interface StatusInfo extends ColoredIconLabeledValue<StatusValues> {}

export interface ConRoleInfo extends ColoredLabeledValue<ConRoleValue> {
  idList: number[];
  search: ApiSearchType<PackageApiValue, ConRoleApiValue>;
  overrides: FlagApiValue[];
}

export interface PackageTemplateInfo<ValueType>
  extends ColoredIconLabeledValue<ValueType> {
  textColor: ColorsPaletteValue;
}

export interface PackageInfo<ValueType extends PackageApiValue | "">
  extends ColoredLabeledValue<ValueType> {
  textColor: ColorsPaletteValue;
  icon: string;
  search: ApiSearchType<ValueType, FlagApiValue>;
}

export interface ConBookInfo extends ColoredLabeledValue<ConBookValue> {
  search: ApiSearchType<PackageApiValue, ConBookApiValue>;
}

export interface StatsConfig {
  flatten?: boolean;
  color?: ColorsPaletteValue | undefined;
  sort?: "value" | "label";
}

export const enum SearchStatusMode {
  idle_no_data = "idle_no_data",
  idle_with_data = "idle_with_data",
  searching = "searching",
  error = "error",
}

export interface IdleWithDataSearchStatus {
  mode: SearchStatusMode.idle_with_data;
}

export interface IdleNoDataSearchStatus {
  mode: SearchStatusMode.idle_no_data;
}

export interface SearchingSearchStatus {
  mode: SearchStatusMode.searching;
  regNumber: number;
}

export interface ErrorSearchStatus {
  mode: SearchStatusMode.error;
  regNumber: number;
  message: string;
}

export type SearchStatus =
  | IdleWithDataSearchStatus
  | IdleNoDataSearchStatus
  | SearchingSearchStatus
  | ErrorSearchStatus;

type Nullable<T> = { [K in keyof T]: T[K] | null };

export interface TransformedAttendeeInfo
  extends Nullable<
    Required<
      Omit<
        ApiAttendeeInfo,
        "spoken_languages" | "flags" | "options" | "packages"
      >
    >
  > {
  readonly transId: string | null;
  readonly transAge: number | null;
  readonly transBirthday: string | null;
  readonly transConRole: ConRoleValue | null;
  readonly transCountryName: string | null;
  readonly transConbookChoice: ConBookValue | null;
  readonly transSponsorChoice: SponsorLevelValue | null;
  readonly transGoodieChoice: GoodiesLevelValue | null;
  readonly transConRoleList: ConRoleValue[] | null;
  readonly transCanCheckin: boolean | null;
  readonly transFullName: string | null;
}

export interface SearchElementProps {
  filterCallback: CallableFunction;
}

export interface ValueGetter<Type extends TransformedAttendeeInfo> {
  (attendee: Type): number | string;
}

export interface ChartData {
  labels: any;
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    hoverBackgroundColor: string[];
  }[];
}

export const enum SortOrder {
  ascending = 1,
  descending = -1,
}

export type SortOrderValues = SortOrder.ascending | SortOrder.descending;

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
  | "transConRole";

export type AllFilterFieldValues = "global" | FilterFieldValue;

export interface MatchStringAgainstList {
  (dataValue: string, filterValue: string[]): boolean;
}

export interface MatchStringAgainstValue {
  (dataValue: string, filterValue: string): boolean;
}

export interface MatchNumberAgainstValue {
  (dataValue: number, filterValue: number): boolean;
}

export type RawAttendeeFilter = Record<
  AllFilterFieldValues,
  DataTableFilterMetaData
>;

export const enum FilterCmpType {
  number = "number",
  ci_str_vs_str = "ci_str_vs_str",
  str_vs_list = "str_vs_list",
  country = "country",
  birthday = "birthday",
}

export type FilterCmpTypeValue = `${FilterCmpType}`;

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

export interface CustomFilterMetaData
  extends Omit<
    DataTableFilterMetaData & ColumnDefinition,
    "fieldName" | "value"
  > {
  fieldName: AllFilterFieldValues;
  value: null | string | string[];
}

export const enum AttendeeQueryStrategy {
  manual = "manual",
  preload = "preload",
  ondemand = "ondemand",
}

export type AttendeeQueryStrategyValue = `${AttendeeQueryStrategy}`;

export interface AttendeeDataOptions {
  queryMode: AttendeeQueryStrategyValue;
  cachedRecords: number | null;
  totalRecords: number;
  loading: boolean;
  sortOrder: DataTableSortMeta[];
  filters: RawAttendeeFilter;
  globalFilterFields: FilterFieldValue[];
}

export const enum TableFilterDisplay {
  menu = "menu",
  row = "row",
}
export type TableFilterDisplayValue = `${TableFilterDisplay}`;

export const enum CheckinDisplay {
  dialog = "dialog",
  below = "below",
  above = "above",
}
export type CheckinDisplayValue = `${CheckinDisplay}`;

export interface AttendeeTableDisplayOptions {
  displayCheckinLocation: CheckinDisplayValue;
  displayColumns: (keyof TransformedAttendeeInfo)[];
  displayRowsPerPage: number;
  checkinAutoClose: boolean;
  filterAutoSelect: boolean;
  filterInputDisplay: TableFilterDisplayValue;
  displayRunner: {
    enabled: boolean;
    location: ToastProps["position"];
    size: number;
    duration: number;
  };
}
