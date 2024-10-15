import { getMainConRoleChoice } from "@/composables/fields/conrole/getMainConRoleChoice";
import { computePackageChoice } from "@/composables/fields/packages/computePackageChoice";
import type { GoodiesLevelValue } from "@/config/metadata/packages/metadataForPerks";
import {
  ColorsPalette,
  type ColorsPaletteValue,
} from "@/composables/theme/colors";
import type { WritableComputedRef } from "vue";
import { ConRole } from "@/config/metadata/flags/metadataForConRoles";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type { ConRoleInfo, PackageInfo } from "@/types/internal/infos";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";

export function getLanyardColor(
  attendeeInfo: TransformedAttendeeInfo
): ColorsPaletteValue {
  const ConRoleInfo: ConRoleInfo = getMainConRoleChoice(
    attendeeInfo.flags_list,
    attendeeInfo.id
  );
  if (ConRoleInfo.value !== ConRole.none) {
    return ConRoleInfo.color;
  }
  const sponsorChoice: WritableComputedRef<GoodiesLevelValue | null> =
    computePackageChoice(
      ref(attendeeInfo.packages_list),
      getConventionSetup().metadata.forSponsorLevels.list
    );
  const sponsorItem: PackageInfo<GoodiesLevelValue> | undefined =
    getConventionSetup().metadata.forSponsorLevels.list.find(
      (entry: PackageInfo<GoodiesLevelValue>) =>
        entry.value === sponsorChoice.value
    );
  if (sponsorItem === undefined) {
    return ColorsPalette.inverted_text;
  }
  return sponsorItem.color;
}
