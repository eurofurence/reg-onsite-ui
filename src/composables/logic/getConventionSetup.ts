import { getMetadataEntryListFromRecord } from "@/composables/collection_tools/metadata/getMetadataEntryListFromRecord";
import { getConInstanceDayAttendanceMetadataList } from "@/composables/fields/attendence/getConInstanceDayAttendanceMetadataList";
import {
  currentConventionSettings,
  currentInventorySubset,
  currentIterationSettings,
  metadataRecordForGoodies,
  type GoodieConfig,
} from "@/config/convention";
import { getMetadataRecordForConRoles } from "@/config/metadata/flags/metadataForConRoles";
import type { ConventionSetup } from "@/types/internal/convention";
import type { ConRoleInfo } from "@/types/internal/infos";

const cachedConventionSetup: ConventionSetup = {
  ...currentConventionSettings,
  ...currentIterationSettings,
  ...{
    inventory: currentInventorySubset,
    metadata: {
      ...currentConventionSettings.metadata,
      ...{
        forAbstractGoodies: {
          record: metadataRecordForGoodies,
          list: getMetadataEntryListFromRecord<GoodieConfig>(
            metadataRecordForGoodies
          ),
        },
        forConRole: {
          record: getMetadataRecordForConRoles(currentIterationSettings),
          list: getMetadataEntryListFromRecord<ConRoleInfo>(
            getMetadataRecordForConRoles(currentIterationSettings)
          ),
        },
        forDayAttendance: {
          list: getConInstanceDayAttendanceMetadataList(
            currentIterationSettings.conDates.start,
            currentIterationSettings.conDates.days,
            currentConventionSettings.metadata.forAttendance.record
          ),
        },
      },
    },
  },
};

export function getConventionSetup(): ConventionSetup {
  return cachedConventionSetup;
}
