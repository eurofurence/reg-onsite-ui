import type { MetadataRecord } from "@/composables/collection_tools/metadata/getMetadataEntryFromRecord";
import { conventionSharedMetadata } from "@/config/convention/commonMetadata";
import {
  iterationEF2023,
  metadataRecordForGoodies2023,
  type AbstractEFGoodieWithVariants2023,
  type AbstractEFGoodieWithoutVariants2023,
  type ConcreteEFGoodieValue2023,
  type EFGoodieConfig2023,
} from "@/config/convention/eurofurence/ef2023";
import {
  iterationEF2024,
  metadataRecordForGoodies2024,
  type AbstractEFGoodieWithVariants2024,
  type AbstractEFGoodieWithoutVariants2024,
  type ConcreteEFGoodieValue2024,
  type EFGoodieConfig2024,
} from "@/config/convention/eurofurence/ef2024";
import {
  iterationEF2025,
  metadataRecordForGoodies2025,
  type AbstractEFGoodieWithVariants2025,
  type AbstractEFGoodieWithoutVariants2025,
  type ConcreteEFGoodieValue2025,
  type EFGoodieConfig2025,
} from "@/config/convention/eurofurence/ef2025";
import {
  iterationEF2026,
  metadataRecordForGoodies2026,
  type AbstractEFGoodieWithVariants2026,
  type AbstractEFGoodieWithoutVariants2026,
  type ConcreteEFGoodieValue2026,
  type EFGoodieConfig2026,
} from "@/config/convention/eurofurence/ef2026";
import efLogoUrl from "@/config/convention/eurofurence/ef_logo.png";
import { efPrimaryColors } from "@/config/convention/eurofurence/theme";
import { defaultEnvironment } from "@/config/environment";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { IdpGroupId } from "@/types/external/authsrv/frontenduserinfo";
import type { AgeInYears } from "@/types/internal/attendee";
import type { ConventionSettings } from "@/types/internal/convention";
import { EnvName } from "@/types/internal/env";

// first entry is the current iteration
const efIterations = [
  { label: "EF 2026", settings: iterationEF2026, record: metadataRecordForGoodies2026 },
  { label: "EF 2025", settings: iterationEF2025, record: metadataRecordForGoodies2025 },
  { label: "EF 2024", settings: iterationEF2024, record: metadataRecordForGoodies2024 },
  { label: "EF 2023", settings: iterationEF2023, record: metadataRecordForGoodies2023 },
];

const [currentEFIteration] = efIterations;
if (currentEFIteration === undefined) {
  throw new Error("No EF iterations configured");
}

const efGoodiesRecord = {
  ...metadataRecordForGoodies2023,
  ...metadataRecordForGoodies2024,
  ...metadataRecordForGoodies2025,
  ...metadataRecordForGoodies2026,
};

export const conventionSettingsForEF: ConventionSettings<EFGoodieConfig> = {
  maxRegNumber: 99999 as RegNumber,
  minAge: 18 as AgeInYears,
  colorPalette: efPrimaryColors,
  links: {
    logoPath: efLogoUrl,
    idpDashboardLink: new URL("https://identity.eurofurence.org/dashboard"),
    privacyLink: new URL("https://help.eurofurence.org/legal/privacy"),
    imprintLink: new URL("https://help.eurofurence.org/legal/imprint"),
  },
  metadata: conventionSharedMetadata,
  auth: {
    admin: [
      defaultEnvironment.envName === EnvName.prod
        ? "54ZYODX1G2K1M76N" // Registration Live - Admin
        : "OE7QZN2RQX9KWML4", // Registration Test - Admin
    ] as IdpGroupId[],
    staff: [
      "54ZYODX15G2K1M76", // Staff
    ] as IdpGroupId[],
    director: [
      "O9ZPL62DKZ8KMNRQ", // Director
    ] as IdpGroupId[],
    dealersDen: [
      "QE3VMR2LK9X1PW07", // Dealers Den - Admin
      "EN3GL42Q072JKZQO", // Dealers Den - Frontdesk
      "PV9M4EXE587GR56K", // Dealers Den - Department
    ] as IdpGroupId[],
    sponsorDesk: [
      "JMV93OXMVQXDN610", // Sponsor Desk
    ] as IdpGroupId[],
    security: [
      "0P9Z712NRQ8VDM5K", // Security - Department
    ] as IdpGroupId[],
    registration: [
      "KVJ7GW273VX3NMZL", // Registration - Department
      "50WYPNXVKL2Q7GDZ", // Registration Software Development - Department
    ] as IdpGroupId[],
  },
  iterations: efIterations,
  goodiesRecord: efGoodiesRecord,
  currentGoodiesRecord: metadataRecordForGoodies2026,
  inventory: {
    // the sponsordesk has at most the items for the super sponsors
    sponsordesk: currentEFIteration.settings.goodies.forPackage.sponsor2 || [],
    constore: Object.keys(efGoodiesRecord) as AbstractEFGoodieValue[],
  },
};

type AbstractEFGoodieWithoutVariants =
  | AbstractEFGoodieWithoutVariants2026
  | AbstractEFGoodieWithoutVariants2025
  | AbstractEFGoodieWithoutVariants2024
  | AbstractEFGoodieWithoutVariants2023;

type AbstractEFGoodieWithVariants =
  | AbstractEFGoodieWithVariants2026
  | AbstractEFGoodieWithVariants2025
  | AbstractEFGoodieWithVariants2024
  | AbstractEFGoodieWithVariants2023;

export type ConcreteEFGoodieValue =
  | ConcreteEFGoodieValue2026
  | ConcreteEFGoodieValue2025
  | ConcreteEFGoodieValue2024
  | ConcreteEFGoodieValue2023;

export type EFGoodieConfig = EFGoodieConfig2023 | EFGoodieConfig2024 | EFGoodieConfig2025 | EFGoodieConfig2026;

export const metadataRecordForGoodiesEF: MetadataRecord<EFGoodieConfig> = {
  ...metadataRecordForGoodies2023,
  ...metadataRecordForGoodies2024,
  ...metadataRecordForGoodies2025,
  ...metadataRecordForGoodies2026,
};

export type AbstractEFGoodieWithVariantsValue =
  `${AbstractEFGoodieWithVariants}`;

export type AbstractEFGoodieValue =
  | `${AbstractEFGoodieWithoutVariants}`
  | AbstractEFGoodieWithVariantsValue;

export interface ConventionGoodieTypesForEF {
  concreteGoodieValue: ConcreteEFGoodieValue;
  goodieConfig: EFGoodieConfig;
  abstractGoodieValue: AbstractEFGoodieValue;
  abstractGoodieWithVariantsValue: AbstractEFGoodieWithVariantsValue;
}
