import { getColorVariants } from "@/composables/colors/getColorVariants";
import { getGradientStyle } from "@/composables/colors/getGradientStyle";
import { getMainConRoleChoice } from "@/composables/fields/conrole/getMainConRoleChoice";
import type { GoodiesLevelValue } from "@/config/metadata/packages/metadataForPerks";
import type { ColorsPaletteValue } from "@/composables/theme/colors";
import { ConRole } from "@/config/metadata/flags/metadataForConRoles";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type { ConRoleInfo, PackageInfo } from "@/types/internal/infos";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";

export function getSponsorLanyardStyle(
  attendeeInfo: TransformedAttendeeInfo | null
): { style: { background: string; color: string } } | {} {
  if (attendeeInfo === null) {
    return {};
  }
  const sponsorItem: PackageInfo<GoodiesLevelValue> | undefined =
    getConventionSetup().metadata.forSponsorLevels.list.find(
      (entry: PackageInfo<GoodiesLevelValue>) =>
        entry.value === attendeeInfo.transSponsorChoice
    );
  if (sponsorItem === undefined) {
    return {};
  }
  let [mainColor, altColor]: [ColorsPaletteValue, ColorsPaletteValue] =
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
