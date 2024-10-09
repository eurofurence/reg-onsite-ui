import { getAllApiRoleItems } from "@/composables/fields/conrole/getAllApiRoleItems";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type { ConRoleInfo } from "@/types/internal/infos";

export function hasRoles(attendee: TransformedAttendeeInfo): boolean {
  const roleItems: ConRoleInfo[] = getAllApiRoleItems(
    attendee.flags_list || [],
    attendee.id
  );
  return roleItems.length > 0;
}
