import {
  getMetadataEntryFromRecord,
  type PartialMetadataRecord,
} from "@/composables/collection_tools/metadata/getMetadataEntryFromRecord";
import type { LabeledValue } from "@/types/internal/infos";

export function getMetadataEntryListFromRecord<
  Type extends LabeledValue<ValueType>,
  ValueType extends string = Type["value"]
>(record: PartialMetadataRecord<Type, ValueType>): Type[] {
  return Object.keys(record).map((recordKey: string) =>
    getMetadataEntryFromRecord(recordKey as ValueType, record)
  );
}
