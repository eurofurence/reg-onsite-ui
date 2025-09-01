import { getConRoleMetadataEntriesExclusive } from "@/composables/fields/conrole/getConRoleMetadataEntriesExclusive";
import {
  ConRole,
  type ConRoleValue,
} from "@/config/metadata/flags/metadataForConRoles";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { FlagValue } from "@/types/internal/fields";
import type { ConRoleInfo } from "@/types/internal/infos";

export function getConRoleValuesInclusive(
  flagValueList: FlagValue[],
  id: RegNumber
): ConRoleValue[] {
  const metadataEntriesExclusive: ConRoleInfo[] =
    getConRoleMetadataEntriesExclusive(flagValueList, id);
  const conRoleValues: ConRoleValue[] = metadataEntriesExclusive.map(
    (item: ConRoleInfo) => item.value
  );
  if (conRoleValues.length === 0) {
    return [ConRole.no_role];
  }
  return conRoleValues;
}
