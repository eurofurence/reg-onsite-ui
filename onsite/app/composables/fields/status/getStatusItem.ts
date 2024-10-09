import { metadataRecordForStatus } from "@/config/metadata/metadataForStatus";
import type { StatusInfo } from "@/types/internal/infos";
import { getMetadataEntry } from "@/composables/collection_tools/getMetadataEntry";
import type { AttendeeApiStatusValues } from "@/config/metadata/metadataForStatus";

export function getStatusItem(value: AttendeeApiStatusValues): StatusInfo {
  return getMetadataEntry<StatusInfo>(value, metadataRecordForStatus);
}
