import { getMetadataEntryFromRecord } from "@/composables/collection_tools/metadata/getMetadataEntryFromRecord";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import type { AbstractGoodieValue, GoodieConfig } from "@/config/convention";

export function getGoodieFromAbstractItem(
  abstractValue: AbstractGoodieValue
): GoodieConfig {
  return getMetadataEntryFromRecord(
    abstractValue,
    getConventionSetup().metadata.forAbstractGoodies.record
  );
}
