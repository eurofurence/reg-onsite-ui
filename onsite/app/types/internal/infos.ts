import type {
  ApiSearchType,
  FlagApiValue,
  PackageApiValue,
} from "@/types/external/attsrv/attendees/attendee";
import type {
  ConBookApiValue,
  ConBookValue,
} from "@/config/metadata/flags/metadataForConBookChoice";
import type {
  ConRoleApiValue,
  ConRoleValue,
} from "@/config/metadata/flags/metadataForConRoles";
import type { ColorsPaletteValue } from "@/composables/theme/colors";
import type { AttendeeApiStatusValues } from "@/config/metadata/metadataForStatus";
import type { PackageValue } from "@/types/internal/fields";

export interface LabeledValue<ValueType> {
  value: ValueType;
  label: string;
  cssClass?: string;
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

export interface StatusInfo
  extends ColoredIconLabeledValue<AttendeeApiStatusValues> {}

export interface ConRoleInfo extends ColoredLabeledValue<ConRoleValue> {
  idList: number[];
  search: ApiSearchType<PackageApiValue, ConRoleApiValue>;
  overrides: ConRoleValue[];
}

export interface PackageTemplateInfo<ValueType>
  extends ColoredIconLabeledValue<ValueType> {
  textColor: ColorsPaletteValue;
}

export interface PackageInfo<ValueType extends PackageValue>
  extends ColoredLabeledValue<ValueType> {
  textColor: ColorsPaletteValue;
  icon: string;
  search: ApiSearchType<ValueType, FlagApiValue>;
}

export interface ConBookInfo extends ColoredLabeledValue<ConBookValue> {
  search: ApiSearchType<PackageApiValue, ConBookApiValue>;
}
