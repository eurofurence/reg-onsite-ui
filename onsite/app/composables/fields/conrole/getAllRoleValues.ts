import { getAllApiRoleItems } from "@/composables/fields/conrole/getAllApiRoleItems";
import type { ConRoleInfo } from "@/types/internal/infos";
import {
  ConRole,
  type ConRoleApiValue,
  type ConRoleValue,
} from "@/config/metadata/flags/metadataForConRoles";
import type { FlagApiValue } from "@/types/external/attsrv/attendees/attendee";

export function getAllRoleValues(
  flagValueList: FlagApiValue[],
  id: number
): ConRoleValue[] {
  const roleItems: ConRoleInfo[] = getAllApiRoleItems(flagValueList, id);
  const roleApiValues: ConRoleApiValue[] = roleItems.map(
    (item: ConRoleInfo) => item.value as ConRoleApiValue
  );
  if (roleApiValues.length > 0) {
    return roleApiValues;
  }
  return (roleApiValues as ConRoleValue[]).concat([ConRole.none]);
}
