import type { MetadataRecord } from "@/composables/collection_tools/metadata/getMetadataEntryFromRecord";
import type { LabeledValue } from "@/types/internal/infos";

export const enum TShirtShape {
  regular = "Regular",
  contoured = "Contoured",
}

export type TShirtShapeValue = `${TShirtShape}`;

export const metadataRecordForTShirtShape: MetadataRecord<
  LabeledValue<TShirtShapeValue>
> = {
  [TShirtShape.regular]: { label: TShirtShape.regular },
  [TShirtShape.contoured]: { label: TShirtShape.contoured },
};
