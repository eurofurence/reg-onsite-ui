import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import { ConRole } from "@/config/metadata/flags/metadataForConRoles";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { FlagValue } from "@/types/internal/fields";
import type { ConRoleInfo } from "@/types/internal/infos";

export function getConRoleMetadataEntriesExclusive(
  flagValueList: FlagValue[] | null,
  id: RegNumber | null
): ConRoleInfo[] {
  let roleItems: ConRoleInfo[] = [];
  if (flagValueList === null || id === null) {
    return [];
  }
  getConventionSetup().metadata.forConRole.list.forEach(
    (conroleInfo: ConRoleInfo) => {
      if (conroleInfo.value === ConRole.no_role) {
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
