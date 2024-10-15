import {
  currentInventorySubset,
  currentIterationSettings,
  metadataRecordForGoodies,
  type GoodieConfig,
} from "@/config/convention";
import type { ConventionSetup } from "@/types/internal/convention";
import { currentConventionSettings } from "@/config/convention";
import { getConInstanceDayAttendanceMetadataList } from "@/composables/fields/attendence/getConInstanceDayAttendanceMetadataList";
import { getMetadataList } from "@/composables/collection_tools/getMetadataList";
import type { ConRoleInfo } from "@/types/internal/infos";
import { getMetadataRecordForConRoles } from "@/config/metadata/flags/metadataForConRoles";

const cachedConventionSetup = {
  ...currentConventionSettings,
  ...currentIterationSettings,
  ...{
    inventory: currentInventorySubset,
    metadata: {
      ...currentConventionSettings.metadata,
      ...{
        forAbstractGoodies: {
          record: metadataRecordForGoodies,
          list: getMetadataList<GoodieConfig>(metadataRecordForGoodies),
        },
        forConRole: {
          record: getMetadataRecordForConRoles(currentIterationSettings),
          list: getMetadataList<ConRoleInfo>(
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
