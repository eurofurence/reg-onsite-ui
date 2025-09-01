import { getConRoleMetadataEntriesExclusive } from "@/composables/fields/conrole/getConRoleMetadataEntriesExclusive";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type { ConRoleInfo } from "@/types/internal/infos";

export function hasRoles(attendee: TransformedAttendeeInfo): boolean {
  const roleItems: ConRoleInfo[] = getConRoleMetadataEntriesExclusive(
    attendee.flags_list || [],
    attendee.id
  );
  return roleItems.length > 0;
}
