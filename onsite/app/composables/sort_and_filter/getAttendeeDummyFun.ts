import type { TransformedAttendeeInfo, ValueGetter } from "@/types/internal";

export function getAttendeeDummyFun<Type extends TransformedAttendeeInfo>(
  fieldName: string
): ValueGetter<Type> {
  return (attendee: Type) => {
    throw new Error(`Unsupported field ${String(fieldName)}`);
  };
}
