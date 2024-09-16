import { setupConRoles } from "@/config/setupConRoles";
import type { FlagApiValue } from "@/types/external";
import type { ConRoleInfo } from "@/types/internal";

export function getAllApiRoleItems(
  flagValueList: FlagApiValue[] | null,
  id: number | null
): ConRoleInfo[] {
  var roleItems: ConRoleInfo[] = [];
  if (flagValueList === null || id === null) {
    return [];
  }
  setupConRoles.forEach((ConRoleInfo: ConRoleInfo) => {
    if (ConRoleInfo.value === "") {
      return;
    }
    var hasRole = false;
    if (flagValueList.includes(ConRoleInfo.value)) {
      hasRole = true;
    } else if (ConRoleInfo.idList.includes(id)) {
      hasRole = true;
    }
    if (hasRole) {
      roleItems.push(ConRoleInfo);
    }
  });
  return roleItems;
}
