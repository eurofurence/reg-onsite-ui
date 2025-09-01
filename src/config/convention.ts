import type { MetadataRecord } from "@/composables/collection_tools/metadata/getMetadataEntryFromRecord";
import {
  conventionSettingsForEF,
  metadataRecordForGoodiesEF,
  type AbstractEFGoodieValue,
  type AbstractEFGoodieWithVariantsValue,
  type ConcreteEFGoodieValue,
  type EFGoodieConfig,
} from "@/config/convention/eurofurence/convention";
import { iterationEF2025 } from "@/config/convention/eurofurence/ef2025";
import type {
  ConventionInventorySettings,
  ConventionIterationSettings,
  ConventionSettings,
} from "@/types/internal/convention";

export type ConcreteGoodieValue = ConcreteEFGoodieValue;
export type GoodieConfig = EFGoodieConfig;
export type AbstractGoodieValue = AbstractEFGoodieValue;
export type AbstractGoodieWithVariantsValue = AbstractEFGoodieWithVariantsValue;
export const metadataRecordForGoodies: MetadataRecord<GoodieConfig> =
  metadataRecordForGoodiesEF;

export const currentConventionSettings: ConventionSettings =
  conventionSettingsForEF;

export const currentIterationSettings: ConventionIterationSettings =
  iterationEF2025;

export const currentInventorySubset: ConventionInventorySettings = {
  // the sponsordesk has at most the items for the super sponsors
  sponsordesk: currentIterationSettings.goodies.forPackage.sponsor2 || [],
  constore: Object.keys(metadataRecordForGoodies) as AbstractGoodieValue[],
};
