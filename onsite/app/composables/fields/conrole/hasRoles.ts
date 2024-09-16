import { getAllApiRoleItems } from "@/composables/fields/conrole/getAllApiRoleItems";
import type { ConRoleInfo, TransformedAttendeeInfo } from "@/types/internal";

export function hasRoles(attendee: TransformedAttendeeInfo): boolean {
  const roleItems: ConRoleInfo[] = getAllApiRoleItems(
    attendee.flags_list || [],
    attendee.id
  );
  return roleItems.length > 0;
}
