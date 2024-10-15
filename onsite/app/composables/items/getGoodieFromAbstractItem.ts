import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import { getMetadataEntry } from "@/composables/collection_tools/getMetadataEntry";
import type { AbstractGoodieValue, GoodieConfig } from "@/config/convention";

export function getGoodieFromAbstractItem(
  abstractValue: AbstractGoodieValue
): GoodieConfig {
  return getMetadataEntry(
    abstractValue,
    getConventionSetup().metadata.forAbstractGoodies.record
  );
}
