import type { LabeledValue, TransformedAttendeeInfo } from "@/types/internal";

export function getLimitedOptionsFromAutoComplete<
  Type extends LabeledValue<ValueType>,
  ValueType
>(
  configItems: Type[],
  autoCompleteData: TransformedAttendeeInfo[] | undefined,
  fieldName: keyof TransformedAttendeeInfo | undefined
): Type[] {
  if (!autoCompleteData || !fieldName) {
    return configItems;
  }
  const mappedValues: ValueType[] = <ValueType[]>(
    autoCompleteData.map(
      (item: TransformedAttendeeInfo) => item[fieldName] || ""
    )
  );
  if (mappedValues.length > 0) {
    return configItems.filter((item: Type) =>
      mappedValues.includes(item.value)
    );
  }
  return configItems;
}
