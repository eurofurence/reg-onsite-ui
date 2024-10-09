import type { MetadataRecord } from "@/composables/collection_tools/getMetadataEntry";
import type { LabeledValue } from "@/types/internal/infos";

export const enum AttendeeApiAttendance {
  full = "attendance",
  day_mon = "day-mon",
  day_tue = "day-tue",
  day_wed = "day-wed",
  day_thu = "day-thu",
  day_fri = "day-fri",
  day_sat = "day-sat",
  day_sun = "day-sun",
}

export type AttendanceApiValue = `${AttendeeApiAttendance}`;

interface AttendanceInfo extends LabeledValue<AttendeeApiAttendance> {
  weekday: number | null;
}

export const metadataRecordForAttendance: MetadataRecord<AttendanceInfo> = {
  [AttendeeApiAttendance.full]: {
    label: "Full",
    weekday: null,
  },
  [AttendeeApiAttendance.day_mon]: {
    label: "Mon",
    weekday: 1,
  },
  [AttendeeApiAttendance.day_tue]: {
    label: "Tue",
    weekday: 2,
  },
  [AttendeeApiAttendance.day_wed]: {
    label: "Wed",
    weekday: 3,
  },
  [AttendeeApiAttendance.day_thu]: {
    label: "Thu",
    weekday: 4,
  },
  [AttendeeApiAttendance.day_fri]: {
    label: "Fri",
    weekday: 5,
  },
  [AttendeeApiAttendance.day_sat]: {
    label: "Sat",
    weekday: 6,
  },
  [AttendeeApiAttendance.day_sun]: {
    label: "Sun",
    weekday: 0,
  },
};
