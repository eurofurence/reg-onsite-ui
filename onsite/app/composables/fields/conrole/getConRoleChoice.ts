import { getAllApiRoleItems } from "@/composables/fields/conrole/getAllApiRoleItems";
import { conRoleNone } from "@/config/setupConRoles";
import type { FlagApiValue } from "@/types/external";
import type { ConRoleInfo } from "@/types/internal";

export function getConRoleChoice(
  flagValueList: FlagApiValue[] | null,
  id: number | null
): ConRoleInfo {
  const allRoles: ConRoleInfo[] = getAllApiRoleItems(flagValueList, id);
  const overrideList: (FlagApiValue | "")[] = allRoles.flatMap(
    (ConRoleInfo: ConRoleInfo) => {
      return ConRoleInfo.overrides || [];
    }
  );
  const reducedRoles: ConRoleInfo[] = allRoles.filter(
    (ConRoleInfo: ConRoleInfo) => !overrideList.includes(ConRoleInfo.value)
  );
  if (reducedRoles.length == 0) {
    return conRoleNone;
  }
  const highestRole: ConRoleInfo = <ConRoleInfo>reducedRoles.slice(-1)[0];
  return highestRole;
}
