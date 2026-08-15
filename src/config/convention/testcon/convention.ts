import { conventionSharedMetadata } from "@/config/convention/commonMetadata";
import {
  metadataRecordForGoodies2023,
  type AbstractTCGoodieWithVariants2023,
  type AbstractTCGoodieWithoutVariants2023,
  type ConcreteTCGoodieValue2023,
  type TCGoodieConfig2023,
} from "@/config/convention/testcon/testcon2023";
import {
  iterationTC2024,
  metadataRecordForGoodies2024,
  type AbstractTCGoodieWithVariants2024,
  type AbstractTCGoodieWithoutVariants2024,
  type ConcreteTCGoodieValue2024,
  type TCGoodieConfig2024,
} from "@/config/convention/testcon/testcon2024";
import {
  iterationTC2025,
  metadataRecordForGoodies2025,
  type AbstractTCGoodieWithVariants2025,
  type AbstractTCGoodieWithoutVariants2025,
  type ConcreteTCGoodieValue2025,
  type TCGoodieConfig2025,
} from "@/config/convention/testcon/testcon2025";
import {
  iterationTC2026,
  metadataRecordForGoodies2026,
  type AbstractTCGoodieWithVariants2026,
  type AbstractTCGoodieWithoutVariants2026,
  type ConcreteTCGoodieValue2026,
  type TCGoodieConfig2026,
} from "@/config/convention/testcon/testcon2026";
import tcLogoUrl from "@/config/convention/testcon/testcon.png";
import { testConPrimaryColors } from "@/config/convention/testcon/theme";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { IdpGroupId } from "@/types/external/authsrv/frontenduserinfo";
import type { AgeInYears } from "@/types/internal/attendee";
import type { ConventionSettings } from "@/types/internal/convention";

// first entry is the current iteration
const testConIterations = [
  { label: "TC 2026", settings: iterationTC2026, record: metadataRecordForGoodies2026 },
  { label: "TC 2025", settings: iterationTC2025, record: metadataRecordForGoodies2025 },
  { label: "TC 2024", settings: iterationTC2024, record: metadataRecordForGoodies2024 },
];

const [currentTestConIteration] = testConIterations;
if (currentTestConIteration === undefined) {
  throw new Error("No TestCon iterations configured");
}

const testConGoodiesRecord = {
  ...metadataRecordForGoodies2023,
  ...metadataRecordForGoodies2024,
  ...metadataRecordForGoodies2025,
  ...metadataRecordForGoodies2026,
};

export const conventionSettingsForTC: ConventionSettings = {
  maxRegNumber: 99999 as RegNumber,
  minAge: 18 as AgeInYears,
  colorPalette: testConPrimaryColors,
  links: {
    logoPath: tcLogoUrl,
    idpDashboardLink: new URL("https://identity.test.con/dashboard"),
    privacyLink: new URL("https://help.test.con/legal/privacy"),
    imprintLink: new URL("https://help.test.con/legal/imprint"),
  },
  metadata: conventionSharedMetadata,
  auth: {
    admin: [
      "ADMIN"
    ] as IdpGroupId[],
    staff: [
      "STAFF"
    ] as IdpGroupId[],
    director: [
      "DIRECTOR"
    ] as IdpGroupId[],
    dealersDen: [
      "SELLER"
    ] as IdpGroupId[],
    sponsorDesk: [
      "SPONSOR"
    ] as IdpGroupId[],
    security: [
      "SEC"
    ] as IdpGroupId[],
    registration: [
      "REG"
    ] as IdpGroupId[],
  },
  iterations: testConIterations,
  goodiesRecord: testConGoodiesRecord,
  currentGoodiesRecord: metadataRecordForGoodies2026,
  inventory: {
    // the sponsordesk has at most the items for the super sponsors
    sponsordesk: currentTestConIteration.settings.goodies.forPackage.sponsor2 || [],
    constore: Object.keys(testConGoodiesRecord) as AbstractTCGoodieValue[],
  },
};

type AbstractTCGoodieWithoutVariants =
  | AbstractTCGoodieWithoutVariants2026
  | AbstractTCGoodieWithoutVariants2025
  | AbstractTCGoodieWithoutVariants2024
  | AbstractTCGoodieWithoutVariants2023;

type AbstractTCGoodieWithVariants =
  | AbstractTCGoodieWithVariants2026
  | AbstractTCGoodieWithVariants2025
  | AbstractTCGoodieWithVariants2024
  | AbstractTCGoodieWithVariants2023;

export type ConcreteTCGoodieValue =
  | ConcreteTCGoodieValue2026
  | ConcreteTCGoodieValue2025
  | ConcreteTCGoodieValue2024
  | ConcreteTCGoodieValue2023;

export type TCGoodieConfig = TCGoodieConfig2023 | TCGoodieConfig2024 | TCGoodieConfig2025 | TCGoodieConfig2026;

export type AbstractTCGoodieWithVariantsValue =
  `${AbstractTCGoodieWithVariants}`;

export type AbstractTCGoodieValue =
  | `${AbstractTCGoodieWithoutVariants}`
  | AbstractTCGoodieWithVariantsValue;

export interface ConventionGoodieTypesForTC {
  concreteGoodieValue: ConcreteTCGoodieValue;
  goodieConfig: TCGoodieConfig;
  abstractGoodieValue: AbstractTCGoodieValue;
  abstractGoodieWithVariantsValue: AbstractTCGoodieWithVariantsValue;
}
