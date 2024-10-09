import type { LabeledValue } from "@/types/internal/infos";

export type MetadataRecord<
  Type extends LabeledValue<ValueType>,
  ValueType extends string = Type["value"]
> = Record<ValueType, Omit<Type, "value">>;

export type PartialMetadataRecord<
  Type extends LabeledValue<ValueType>,
  ValueType extends string = Type["value"]
> = Partial<Record<ValueType, Omit<Type, "value">>>;

export function getMetadataEntry<
  Type extends LabeledValue<ValueType>,
  ValueType extends string = Type["value"]
>(recordKey: ValueType, record: PartialMetadataRecord<Type, ValueType>): Type {
  return {
    ...{ value: recordKey },
    ...record[recordKey],
  } as Type;
}
