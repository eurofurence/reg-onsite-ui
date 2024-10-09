import { getAllApiRoleItems } from "@/composables/fields/conrole/getAllApiRoleItems";
import type { ConRoleInfo } from "@/types/internal/infos";
import {
  ConRole,
  metadataRecordForConRoles,
  type ConRoleValue,
} from "@/config/metadata/flags/metadataForConRoles";
import type { FlagApiValue } from "@/types/external/attsrv/attendees/attendee";
import { getMetadataEntry } from "@/composables/collection_tools/getMetadataEntry";

export function getMainConRoleChoice(
  flagValueList: FlagApiValue[] | null,
  id: number | null
): ConRoleInfo {
  const allRoles: ConRoleInfo[] = getAllApiRoleItems(flagValueList, id);
  const overrideList: ConRoleValue[] = allRoles.flatMap(
    (ConRoleInfo: ConRoleInfo) => {
      return ConRoleInfo.overrides || [];
    }
  );
  const reducedRoles: ConRoleInfo[] = allRoles.filter(
    (ConRoleInfo: ConRoleInfo) => !overrideList.includes(ConRoleInfo.value)
  );
  if (reducedRoles.length == 0) {
    return getMetadataEntry<ConRoleInfo>(
      ConRole.none,
      metadataRecordForConRoles
    );
  }
  const highestRole: ConRoleInfo = reducedRoles.slice(-1)[0] as ConRoleInfo;
  return highestRole;
}
