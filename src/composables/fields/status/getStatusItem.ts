import { getMetadataEntryFromRecord } from "@/composables/collection_tools/metadata/getMetadataEntryFromRecord";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import type { AttendeeApiStatusValues } from "@/config/metadata/metadataForStatus";
import type { StatusInfo } from "@/types/internal/infos";

export function getStatusItem(value: AttendeeApiStatusValues): StatusInfo {
  return getMetadataEntryFromRecord<StatusInfo>(
    value,
    getConventionSetup().metadata.forStatus.record
  );
}
