import type { StatusInfo } from "@/types/internal/infos";
import { getMetadataEntry } from "@/composables/collection_tools/getMetadataEntry";
import type { AttendeeApiStatusValues } from "@/config/metadata/metadataForStatus";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";

export function getStatusItem(value: AttendeeApiStatusValues): StatusInfo {
  return getMetadataEntry<StatusInfo>(
    value,
    getConventionSetup().metadata.forStatus.record
  );
}
