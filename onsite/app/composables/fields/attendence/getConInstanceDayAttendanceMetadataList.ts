import type { AttendanceInfo } from "@/types/internal/infos";
import type { MetadataRecord } from "@/composables/collection_tools/getMetadataEntry";
import { getMetadataList } from "@/composables/collection_tools/getMetadataList";
import type { ConDays } from "@/types/internal/convention";

export function getConInstanceDayAttendanceMetadataList(
  configConStartDate: Date,
  configConDays: ConDays,
  metadataRecordForAttendance: MetadataRecord<AttendanceInfo>
): AttendanceInfo[] {
  var result: AttendanceInfo[] = [];
  const localeName: string = "en-GB";
  for (
    let dayOffset: ConDays = 0 as ConDays;
    dayOffset < configConDays;
    dayOffset++
  ) {
    let curDate: Date = new Date(configConStartDate.valueOf());
    curDate.setDate(curDate.getDate() + dayOffset);
    const curMonthStr: string = curDate.toLocaleString(localeName, {
      month: "short",
    });
    const curDayStr: string = curDate.toLocaleString(localeName, {
      day: "2-digit",
    });
    for (const entry of getMetadataList(metadataRecordForAttendance)) {
      if (entry.weekday === curDate.getDay()) {
        entry.label = `${entry.label} (${curMonthStr}-${curDayStr})`;
        result.push(entry);
      }
    }
  }
  return result;
}
