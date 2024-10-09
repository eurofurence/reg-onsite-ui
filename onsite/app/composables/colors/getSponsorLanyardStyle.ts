import { getColorVariants } from "@/composables/colors/getColorVariants";
import { getGradientStyle } from "@/composables/colors/getGradientStyle";
import { getMainConRoleChoice } from "@/composables/fields/conrole/getMainConRoleChoice";
import type { GoodiesLevelValue } from "@/config/metadata/packages/metadataForPerks";
import { metadataListForSponsorLevels } from "@/config/metadata/packages/metadataForSponsorLevels";
import type { ColorsPaletteValue } from "@/composables/theme/colors";
import { ConRole } from "@/config/metadata/flags/metadataForConRoles";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type { ConRoleInfo, PackageInfo } from "@/types/internal/infos";

export function getSponsorLanyardStyle(
  attendeeInfo: TransformedAttendeeInfo | null
): { style: { background: string; color: string } } | {} {
  if (attendeeInfo === null) {
    return {};
  }
  const sponsorItem: PackageInfo<GoodiesLevelValue> | undefined =
    metadataListForSponsorLevels.find(
      (entry: PackageInfo<GoodiesLevelValue>) =>
        entry.value === attendeeInfo.transSponsorChoice
    );
  if (sponsorItem === undefined) {
    return {};
  }
  var [mainColor, altColor]: [ColorsPaletteValue, ColorsPaletteValue] =
    getColorVariants(sponsorItem.color);
  const role: ConRoleInfo = getMainConRoleChoice(
    attendeeInfo.flags_list,
    attendeeInfo.id
  );
  if (role.value !== ConRole.none) {
    altColor = role.color;
  }
  return getGradientStyle(mainColor, altColor, sponsorItem.textColor);
}
