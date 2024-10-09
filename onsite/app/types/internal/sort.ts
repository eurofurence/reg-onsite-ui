import type { TransformedAttendeeInfo } from "@/types/internal/attendee";

export interface ValueGetter<Type extends TransformedAttendeeInfo> {
  (attendee: Type): number | string;
}

export const enum SortOrder {
  ascending = 1,
  descending = -1,
}

export type SortOrderValues = SortOrder.ascending | SortOrder.descending;
