import type { Branded } from "@/composables/brand";
import type { MetadataRecord } from "@/composables/collection_tools/metadata/getMetadataEntryFromRecord";
import type { AbstractGoodieValue, GoodieConfig } from "@/config/convention";
import type { ConRole } from "@/config/metadata/flags/metadataForConRoles";
import type { CountryCode } from "@/config/metadata/metadataForCountry";
import type { LanguageCode } from "@/config/metadata/metadataForLanguage";
import type { ArtShowPanelValue } from "@/config/metadata/packages/metadataForArtShowPanels";
import type { ArtShowTableValue } from "@/config/metadata/packages/metadataForArtShowTables";
import type { BoatLevelValue } from "@/config/metadata/packages/metadataForBoatLevel";
import type { DealerTableValue } from "@/config/metadata/packages/metadataForDealerPackages";
import type {
  GoodiesLevelValue,
  SponsorLevelValue,
} from "@/config/metadata/packages/metadataForPerks";
import type { TicketTypeValue } from "@/config/metadata/packages/metadataForTicketType";
import type { TShirtShapeValue } from "@/config/metadata/tshirt/metadataForTShirtShapes";
import type { TShirtSizeValue } from "@/config/metadata/tshirt/metadataForTShirtSizes";
import type {
  PlaceHolderTShirtType,
  TShirtInfo,
} from "@/config/metadata/tshirt/metadataForTShirtTypes";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { IdpGroupId } from "@/types/external/authsrv/frontenduserinfo";
import type { AgeInYears } from "@/types/internal/attendee";
import type {
  AttendanceInfo,
  ConBookInfo,
  ConRoleInfo,
  LabeledValue,
  PackageInfo,
  StatusInfo,
} from "@/types/internal/infos";

export type MetadataEntry<
  Type extends LabeledValue<ValueType>,
  ValueType extends string = Type["value"]
> = {
  record: MetadataRecord<Type>;
  list: Type[];
};

export interface ConventionSharedMetadata {
  forArtShowPanels: MetadataEntry<LabeledValue<ArtShowPanelValue>>;
  forArtShowTables: MetadataEntry<LabeledValue<ArtShowTableValue>>;
  forAttendance: MetadataEntry<AttendanceInfo>;
  forBoatLevel: MetadataEntry<LabeledValue<BoatLevelValue>>;
  forConBook: MetadataEntry<ConBookInfo>;
  forCountry: MetadataEntry<LabeledValue<CountryCode>>;
  forDealerPackage: MetadataEntry<LabeledValue<DealerTableValue>>;
  forGoodiesLevels: MetadataEntry<PackageInfo<GoodiesLevelValue>>;
  forLanguage: MetadataEntry<LabeledValue<LanguageCode>>;
  forSponsorLevels: MetadataEntry<PackageInfo<SponsorLevelValue>>;
  forStatus: MetadataEntry<StatusInfo>;
  forTicketType: MetadataEntry<LabeledValue<TicketTypeValue>>;
  forTShirtShapes: MetadataEntry<LabeledValue<TShirtShapeValue>>;
  forTShirtSizes: MetadataEntry<LabeledValue<TShirtSizeValue>>;
  forTShirtTypes: {
    list: (TShirtInfo | PlaceHolderTShirtType)[];
  };
}

export const enum AuthGroups {
  admin = "admin",
  dealersDen = "dealersDen",
  security = "security",
  registration = "registration",
  sponsorDesk = "sponsorDesk",
}

export type AuthGroupValue = `${AuthGroups}`;

export type ThemeColorPalette = { [key: string]: string };

export interface ConventionSettings {
  links: {
    logoPath: string;
    idpDashboardLink: URL;
    privacyLink: URL;
    imprintLink: URL;
  };
  colorPalette: ThemeColorPalette;
  maxRegNumber: RegNumber;
  minAge: AgeInYears;
  metadata: ConventionSharedMetadata;
  auth: Partial<Record<AuthGroupValue, IdpGroupId[]>>;
}

export type ConDays = Branded<number, "ConDays">;

export interface ConventionIterationSettings {
  conDates: {
    start: Date;
    days: ConDays;
  };
  vip: {
    regNumberList: RegNumber[];
  };
  goodies: {
    forPackage: Partial<Record<GoodiesLevelValue, AbstractGoodieValue[]>>;
    forFlag: Partial<Record<ConRole, AbstractGoodieValue[]>>;
    forRegNumber: Record<string, AbstractGoodieValue[]>;
  };
}

export interface ConventionInventorySettings {
  sponsordesk: AbstractGoodieValue[];
  constore: AbstractGoodieValue[];
}

interface ConventionMetadata extends ConventionSharedMetadata {
  forAbstractGoodies: MetadataEntry<GoodieConfig>;
  forConRole: MetadataEntry<ConRoleInfo>;
  forDayAttendance: { list: AttendanceInfo[] };
}

export type ConventionSetup = ConventionIterationSettings &
  Omit<ConventionSettings, "metadata"> & {
    metadata: ConventionMetadata;
    inventory: ConventionInventorySettings;
  };
