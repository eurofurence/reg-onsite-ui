import { getMetadataEntryFromRecord } from "@/composables/collection_tools/metadata/getMetadataEntryFromRecord";
import { getConRoleMetadataEntriesExclusive } from "@/composables/fields/conrole/getConRoleMetadataEntriesExclusive";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import {
  ConRole,
  type ConRoleValue,
} from "@/config/metadata/flags/metadataForConRoles";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { FlagValue } from "@/types/internal/fields";
import type { ConRoleInfo } from "@/types/internal/infos";

export function getMainConRoleChoice(
  flagValueList: FlagValue[] | null,
  id: RegNumber | null
): ConRoleInfo {
  const metadataEntriesExclusive: ConRoleInfo[] =
    getConRoleMetadataEntriesExclusive(flagValueList, id);
  const overrideList: ConRoleValue[] = metadataEntriesExclusive.flatMap(
    (ConRoleInfo: ConRoleInfo) => {
      return ConRoleInfo.overrides || [];
    }
  );
  const reducedRoles: ConRoleInfo[] = metadataEntriesExclusive.filter(
    (ConRoleInfo: ConRoleInfo) => !overrideList.includes(ConRoleInfo.value)
  );
  if (reducedRoles.length == 0) {
    return getMetadataEntryFromRecord<ConRoleInfo>(
      ConRole.no_role,
      getConventionSetup().metadata.forConRole.record
    );
  }
  const highestRole: ConRoleInfo = reducedRoles.slice(-1)[0] as ConRoleInfo;
  return highestRole;
}
