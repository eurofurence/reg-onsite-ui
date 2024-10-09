import type { ApiAttendeeInfo } from "@/types/external/attsrv/attendees/attendee";
import type {
  GoodiesLevelValue,
  SponsorLevelValue,
} from "@/config/metadata/packages/metadataForPerks";
import type { ConBookValue } from "@/config/metadata/flags/metadataForConBookChoice";
import type { ConRoleValue } from "@/config/metadata/flags/metadataForConRoles";
import type { Nullable } from "@/types/internal/common";

type RemovedFieldsFromAttendeeInfo =
  | "spoken_languages"
  | "flags"
  | "options"
  | "packages";

export interface TransformedAttendeeInfoInternal
  extends Required<Omit<ApiAttendeeInfo, RemovedFieldsFromAttendeeInfo>> {
  readonly transId: string;
  readonly transAge: number;
  readonly transFullName: string;
  readonly transBirthday: string;
  readonly transConRole: ConRoleValue;
  readonly transCountryName: string;
  readonly transConbookChoice: ConBookValue;
  readonly transSponsorChoice: SponsorLevelValue;
  readonly transGoodieChoice: GoodiesLevelValue;
  readonly transCanCheckin: boolean;
}

export interface TransformedAttendeeInfo
  extends Nullable<TransformedAttendeeInfoInternal> {}
