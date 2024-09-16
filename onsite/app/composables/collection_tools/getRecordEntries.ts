export function getRecordEntries<RecordKey extends string, RecordValue>(
  record: Partial<Record<RecordKey, RecordValue>>
) {
  return Object.entries(record) as [RecordKey, RecordValue][];
}
