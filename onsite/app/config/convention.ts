import type {
  ConventionInventorySettings,
  ConventionIterationSettings,
  ConventionSettings,
} from "@/types/internal/convention";
import {
  conventionSettingsForEF,
  metadataRecordForGoodiesEF,
  type AbstractEFGoodieValue,
  type AbstractEFGoodieWithVariantsValue,
  type ConcreteEFGoodieValue,
  type EFGoodieConfig,
} from "@/config/convention/eurofurence/convention";
import { iterationEF2024 } from "@/config/convention/eurofurence/ef2024";
import type { MetadataRecord } from "@/composables/collection_tools/getMetadataEntry";

export type ConcreteGoodieValue = ConcreteEFGoodieValue;
export type GoodieConfig = EFGoodieConfig;
export type AbstractGoodieValue = AbstractEFGoodieValue;
export type AbstractGoodieWithVariantsValue = AbstractEFGoodieWithVariantsValue;
export const metadataRecordForGoodies: MetadataRecord<GoodieConfig> =
  metadataRecordForGoodiesEF;

export const currentConventionSettings: ConventionSettings =
  conventionSettingsForEF;

export const currentIterationSettings: ConventionIterationSettings =
  iterationEF2024;

export const currentInventorySubset: ConventionInventorySettings = {
  sponsordesk: currentIterationSettings.goodies.forPackage.sponsor2 || [],
  constore: Object.keys(metadataRecordForGoodies) as AbstractGoodieValue[],
};
