import type { FlagApiValue } from "@/types/external/attsrv/attendees/attendee";
import type { ConRoleInfo } from "@/types/internal/infos";
import {
  ConRole,
  metadataListForConRoles,
} from "@/config/metadata/flags/metadataForConRoles";

export function getAllApiRoleItems(
  flagValueList: FlagApiValue[] | null,
  id: number | null
): ConRoleInfo[] {
  var roleItems: ConRoleInfo[] = [];
  if (flagValueList === null || id === null) {
    return [];
  }
  metadataListForConRoles.forEach((conroleInfo: ConRoleInfo) => {
    if (conroleInfo.value === ConRole.none) {
      return;
    }
    var hasRole = false;
    if (flagValueList.includes(conroleInfo.value)) {
      hasRole = true;
    } else if (conroleInfo.idList.includes(id)) {
      hasRole = true;
    }
    if (hasRole) {
      roleItems.push(conroleInfo);
    }
  });
  return roleItems;
}
