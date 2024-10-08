import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type { LabeledValue } from "@/types/internal/infos";

export function getLimitedOptionsFromAutoComplete<
  Type extends LabeledValue<ValueType>,
  ValueType
>(
  selectedOptions: ValueType[],
  configItems: Type[],
  autoCompleteData: TransformedAttendeeInfo[] | undefined,
  fieldName: keyof TransformedAttendeeInfo | undefined
): Type[] {
  if (!autoCompleteData || !fieldName) {
    return configItems;
  }
  const mappedValues: ValueType[] = autoCompleteData.map(
    (item: TransformedAttendeeInfo) => item[fieldName] || ""
  ) as ValueType[];
  if (mappedValues.length > 0) {
    return configItems.filter(
      (item: Type) =>
        mappedValues.includes(item.value) ||
        selectedOptions.includes(item.value)
    );
  }
  return configItems;
}
