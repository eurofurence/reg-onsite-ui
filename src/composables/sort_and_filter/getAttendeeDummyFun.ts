import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type { ValueGetter } from "@/types/internal/sort";

export function getAttendeeDummyFun<Type extends TransformedAttendeeInfo>(
  fieldName: string
): ValueGetter<Type> {
  return (_attendee: Type) => {
    throw new Error(`Unsupported field ${String(fieldName)}`);
  };
}
