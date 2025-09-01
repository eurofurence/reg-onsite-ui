import type { Branded } from "@/composables/brand";
import type { ConBookApiValue } from "@/config/metadata/flags/metadataForConBookChoice";
import type { ConRoleApiValue } from "@/config/metadata/flags/metadataForConRoles";
import type { CountryCode } from "@/config/metadata/metadataForCountry";
import type { LanguageCode } from "@/config/metadata/metadataForLanguage";
import type { AttendeeApiStatusValues } from "@/config/metadata/metadataForStatus";
import type { ArtShowPanelApiValue } from "@/config/metadata/packages/metadataForArtShowPanels";
import type { ArtShowTableApiValue } from "@/config/metadata/packages/metadataForArtShowTables";
import type { AttendanceApiValue } from "@/config/metadata/packages/metadataForAttendance";
import type { BoatLevelValue } from "@/config/metadata/packages/metadataForBoatLevel";
import type { DealerTableApiValue } from "@/config/metadata/packages/metadataForDealerPackages";
import type { GoodiesLevelApiValue } from "@/config/metadata/packages/metadataForPerks";
import type { TicketTypeValue } from "@/config/metadata/packages/metadataForTicketType";
import type { TShirtTypeValue } from "@/config/metadata/tshirt/metadataForTShirtTypes";
import type { FlagValue } from "@/types/internal/fields";
import type { NoFlag, NoPackage } from "@/types/internal/missing";

const enum UnusedPackages {
  room_none = "room-none",
  stage = "stage",
}

type UnusedPackagesValues = `${UnusedPackages}`;

export type PackageApiValue =
  | ArtShowPanelApiValue
  | ArtShowTableApiValue
  | DealerTableApiValue
  | GoodiesLevelApiValue
  | BoatLevelValue
  | TicketTypeValue
  | AttendanceApiValue
  | UnusedPackagesValues;

export type PackageValue =
  | ArtShowPanelApiValue
  | ArtShowTableApiValue
  | DealerTableApiValue
  | GoodiesLevelApiValue
  | BoatLevelValue
  | TicketTypeValue
  | AttendanceApiValue
  | UnusedPackagesValues;

export interface PackageCountType {
  name: PackageApiValue;
  count: number;
}

const enum OtherFlag {
  anon = "anon",
  ev_member = "ev",
  hc = "hc",
  terms_accepted = "terms-accepted",
  skip_ban_check = "skip_ban_check",
}
type OtherFlagApiValues = `${OtherFlag}`;

const enum Option {
  anim = "anim",
  art = "art",
  music = "music",
  suit = "suit",
}
export type OptionValues = `${Option}`;

export type FlagApiValue =
  | ConBookApiValue
  | ConRoleApiValue
  | OtherFlagApiValues;

export interface ApiSearchType<
  PackageApiValueType extends PackageValue,
  FlagApiValueType extends FlagValue
> {
  ids?: RegNumber[];
  packages?: Partial<
    Record<Exclude<PackageApiValueType, NoPackage.no_package>, number>
  >;
  flags?: Partial<Record<Exclude<FlagApiValueType, NoFlag.no_flag>, number>>;
  nickname?: string;
}

export type RegNumber = Branded<number, "RegNumber">;
export type MoneyInCent = Branded<number, "MoneyInCent">;
export type IsoBirthdayStr = Branded<string, "IsoBirthdayStr">;

export interface ApiAttendeeInfo {
  id: RegNumber;
  badge_id?: string;
  nickname: string;
  first_name: string;
  last_name: string;
  country: CountryCode;
  birthday: IsoBirthdayStr;
  pronouns?: string;
  tshirt_size?: TShirtTypeValue;
  spoken_languages: string;
  spoken_languages_list: LanguageCode[];
  registration_language: string;
  flags: string;
  flags_list: FlagApiValue[];
  options: string;
  options_list?: OptionValues[];
  packages: string;
  packages_list: PackageCountType[];
  status: AttendeeApiStatusValues;
  total_dues: MoneyInCent;
  payment_balance: MoneyInCent;
  current_dues: MoneyInCent;
  identity_subject?: string;
  avatar?: string;
  street?: string;
  zip?: string;
  city?: string;
  email?: string;
  phone?: string;
  gender?: string;
  user_comments?: string;
  telegram?: string;
  partner?: string;
  state?: string;
}

export interface ApiFindResponse {
  attendees: ApiAttendeeInfo[];
}
