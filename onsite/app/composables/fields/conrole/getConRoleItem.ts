import { convertListToMap } from "@/composables/collection_tools/convertListToMap";
import { setupConRoles, type ConRoleValue } from "@/config/setupConRoles";
import type { ConRoleInfo } from "@/types/internal";

const propertyMap: Map<ConRoleValue, ConRoleInfo> =
  convertListToMap(setupConRoles);

export function getConRoleItem(value: ConRoleValue): ConRoleInfo {
  const result: ConRoleInfo | undefined = propertyMap.get(value);
  if (result === undefined) {
    throw new Error(`Invalid status ${value}`);
  }
  return result;
}
