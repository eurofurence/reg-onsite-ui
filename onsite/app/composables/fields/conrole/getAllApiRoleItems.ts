import type {
  FlagApiValue,
  RegNumber,
} from "@/types/external/attsrv/attendees/attendee";
import type { ConRoleInfo } from "@/types/internal/infos";
import { ConRole } from "@/config/metadata/flags/metadataForConRoles";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";

export function getAllApiRoleItems(
  flagValueList: FlagApiValue[] | null,
  id: RegNumber | null
): ConRoleInfo[] {
  let roleItems: ConRoleInfo[] = [];
  if (flagValueList === null || id === null) {
    return [];
  }
  getConventionSetup().metadata.forConRole.list.forEach(
    (conroleInfo: ConRoleInfo) => {
      if (conroleInfo.value === ConRole.none) {
        return;
      }
      let hasRole = false;
      if (flagValueList.includes(conroleInfo.value)) {
        hasRole = true;
      } else if (conroleInfo.idList.includes(id)) {
        hasRole = true;
      }
      if (hasRole) {
        roleItems.push(conroleInfo);
      }
    }
  );
  return roleItems;
}
