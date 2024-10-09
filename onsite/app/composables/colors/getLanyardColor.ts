import { getMainConRoleChoice } from "@/composables/fields/conrole/getMainConRoleChoice";
import { computePackageChoice } from "@/composables/fields/packages/computePackageChoice";
import type { GoodiesLevelValue } from "@/config/metadata/packages/metadataForPerks";
import { metadataListForSponsorLevels } from "@/config/metadata/packages/metadataForSponsorLevels";
import {
  ColorsPalette,
  type ColorsPaletteValue,
} from "@/composables/theme/colors";
import type { WritableComputedRef } from "vue";
import { ConRole } from "@/config/metadata/flags/metadataForConRoles";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type { ConRoleInfo, PackageInfo } from "@/types/internal/infos";

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
      metadataListForSponsorLevels
    );
  const sponsorItem: PackageInfo<GoodiesLevelValue> | undefined =
    metadataListForSponsorLevels.find(
      (entry: PackageInfo<GoodiesLevelValue>) =>
        entry.value === sponsorChoice.value
    );
  if (sponsorItem === undefined) {
    return ColorsPalette.inverted_text;
  }
  return sponsorItem.color;
}
