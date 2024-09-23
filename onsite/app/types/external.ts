import type { ArtShowPanelApiValue } from "@/config/packages/setupArtShowPanels";
import type { ArtShowTableApiValue } from "@/config/packages/setupArtShowTables";
import type { ConBookApiValue } from "@/config/flags/setupConBookChoices";
import type { CountryCode } from "@/config/setupCountries";
import type { DayAttendanceValue } from "@/config/packages/setupDayAttendance";
import type { DealerTableApiValue } from "@/config/setupDealerPackages";
import type { OtherPackageApiValue } from "@/config/packages/setupOtherPackages";
import type { GoodiesLevelApiValue } from "@/config/packages/setupPackages";
import type { ConRoleApiValue } from "@/config/setupConRoles";
import type { StatusValues } from "@/config/setupStatus";
import type { TShirtShapeValue } from "@/config/setupTShirtShapes";
import type { TShirtSizeValue } from "@/config/tshirt/setupTShirtSizes";
import type { TShirtTypeValue } from "@/config/tshirt/setupTShirtTypes";
import type { ConcreteTrinketValue } from "@/setupEFIteration";
import type { ConfirmationOptions } from "primevue/confirmationoptions";

export interface ConfirmServiceMethods {
  require: (option: ConfirmationOptions) => void;
  close: () => void;
}

const enum UnusedPackages {
  attendance = "attendance",
  room_none = "room-none",
  stage = "stage",
}

type UnusedPackagesValues = `${UnusedPackages}`;

export type PackageApiValue =
  | ArtShowPanelApiValue
  | ArtShowTableApiValue
  | DealerTableApiValue
  | GoodiesLevelApiValue
  | OtherPackageApiValue
  | DayAttendanceValue
  | UnusedPackagesValues;

export interface PackageCountType<Type> {
  name: Type;
  count: number;
}

const enum OtherFlag {
  anon = "anon",
  ev = "ev",
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

export interface ApiError {
  message: string;
  timestamp: string;
  requestid: string;
  details?: string | { details: string } | { details: { details: string[] } };
}

export interface ApiFrontendUserInfo {
  audiences: string[];
  subject: string;
  name: string;
  email: string;
  email_verified: boolean;
  groups: string[];
}

export type FlagApiValue =
  | ConBookApiValue
  | ConRoleApiValue
  | OtherFlagApiValues;

export interface ApiSearchType<
  PackageApiValueType extends PackageApiValue | "",
  FlagApiValueType extends FlagApiValue | ""
> {
  ids?: number[];
  packages?: Partial<Record<Exclude<PackageApiValueType, "">, number>>;
  flags?: Partial<Record<Exclude<FlagApiValueType, "">, number>>;
  nickname?: string;
}

export interface ApiAttendeeInfo {
  id: number;
  badge_id: string;
  nickname: string;
  first_name: string;
  last_name: string;
  country: string;
  birthday: string;
  pronouns?: string;
  tshirt_size?: TShirtTypeValue;
  spoken_languages: string;
  spoken_languages_list: string[];
  registration_language: string;
  flags: string;
  flags_list: FlagApiValue[];
  options: string;
  options_list?: OptionValues[];
  packages: string;
  packages_list: PackageCountType<PackageApiValue>[];
  status: StatusValues;
  total_dues: number;
  payment_balance: number;
  current_dues: number;
  street?: string;
  zip?: string;
  city?: string;
  email?: string;
  state?: string;
}

export const enum ShippingEmailUse {
  email_can_be_shared_with_logistics = "status",
  email_is_private = "none",
}

export type ShippingEmailUseValue = `${ShippingEmailUse}`;

export interface ApiShippingAddInfo {
  id: number;
  nickname: string;
  first_name: string;
  last_name: string;
  street: string;
  zip: string;
  city: string;
  email: string;
  country: CountryCode;
  state: string;
  comments: string;
  tshirt_size: TShirtSizeValue;
  tshirt_shape: TShirtShapeValue;
  shipping_email: ShippingEmailUseValue;
}

export interface ApiRegListResponse {
  ids: number[];
}

export interface ApiFindResponse {
  attendees: ApiAttendeeInfo[];
}

export interface ApiSponsorDeskAddInfo {
  pastItems: ConcreteTrinketValue[];
  reservedItems: ConcreteTrinketValue[];
  issuedItems: ConcreteTrinketValue[];
}

export interface ApiAllSponsorDeskAddInfoRaw {
  area: string;
  values: Record<string, string>;
}

export interface ApiAllSponsorDeskAddInfo {
  area: string;
  infos: Map<number, ApiSponsorDeskAddInfo>;
}

export type ApiAttendeeStatusHistory = {};
