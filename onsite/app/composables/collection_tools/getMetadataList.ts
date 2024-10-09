import type { LabeledValue } from "@/types/internal/infos";
import {
  getMetadataEntry,
  type PartialMetadataRecord,
} from "@/composables/collection_tools/getMetadataEntry";

export function getMetadataList<
  Type extends LabeledValue<ValueType>,
  ValueType extends string = Type["value"]
>(record: PartialMetadataRecord<Type, ValueType>): Type[] {
  return Object.keys(record).map((recordKey: string) =>
    getMetadataEntry(recordKey as ValueType, record)
  );
}
