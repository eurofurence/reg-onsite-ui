import { getAllApiRoleItems } from "@/composables/fields/conrole/getAllApiRoleItems";
import {
  ConRole,
  type ConRoleApiValue,
  type ConRoleValue,
} from "@/config/setupConRoles";
import type { FlagApiValue } from "@/types/external";
import type { ConRoleInfo } from "@/types/internal";

export function getAllRoleValues(
  flagValueList: FlagApiValue[],
  id: number
): ConRoleValue[] {
  const roleItems: ConRoleInfo[] = getAllApiRoleItems(flagValueList, id);
  const roleApiValues: ConRoleApiValue[] = roleItems.map(
    (item: ConRoleInfo) => <ConRoleApiValue>item.value
  );
  if (roleApiValues.length > 0) {
    return roleApiValues;
  }
  return (<ConRoleValue[]>roleApiValues).concat([ConRole.none]);
}
