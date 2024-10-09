import type { MetadataRecord } from "@/composables/collection_tools/getMetadataEntry";
import { getMetadataList } from "@/composables/collection_tools/getMetadataList";
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

export const metadataListForTShirtShape: LabeledValue<TShirtShapeValue>[] =
  getMetadataList(metadataRecordForTShirtShape);
