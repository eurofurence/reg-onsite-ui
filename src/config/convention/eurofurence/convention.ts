import type { MetadataRecord } from "@/composables/collection_tools/metadata/getMetadataEntryFromRecord";
import { conventionSharedMetadata } from "@/config/convention/commonMetadata";
import {
  metadataRecordForGoodies2023,
  type AbstractEFGoodieWithVariants2023,
  type AbstractEFGoodieWithoutVariants2023,
  type ConcreteEFGoodieValue2023,
  type EFGoodieConfig2023,
} from "@/config/convention/eurofurence/ef2023";
import {
  metadataRecordForGoodies2024,
  type AbstractEFGoodieWithVariants2024,
  type AbstractEFGoodieWithoutVariants2024,
  type ConcreteEFGoodieValue2024,
  type EFGoodieConfig2024,
} from "@/config/convention/eurofurence/ef2024";
import {
  metadataRecordForGoodies2025,
  type AbstractEFGoodieWithVariants2025,
  type AbstractEFGoodieWithoutVariants2025,
  type ConcreteEFGoodieValue2025,
  type EFGoodieConfig2025,
} from "@/config/convention/eurofurence/ef2025";
import {
  metadataRecordForGoodies2026,
  type AbstractEFGoodieWithVariants2026,
  type AbstractEFGoodieWithoutVariants2026,
  type ConcreteEFGoodieValue2026,
  type EFGoodieConfig2026,
} from "@/config/convention/eurofurence/ef2026";
import efLogoUrl from "@/config/convention/eurofurence/ef_logo.png";
import { efPrimaryColors } from "@/config/convention/eurofurence/theme";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { IdpGroupId } from "@/types/external/authsrv/frontenduserinfo";
import type { AgeInYears } from "@/types/internal/attendee";
import type { ConventionSettings } from "@/types/internal/convention";

export const conventionSettingsForEF: ConventionSettings = {
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
      "OE7QZN2RQX9KWML4", // Registration Test - Admin
      "54ZYODX1G2K1M76N", // Registration Live - Admin
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
