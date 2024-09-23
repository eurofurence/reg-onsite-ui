import { getColorVariants } from "@/composables/colors/getColorVariants";
import { getGradientStyle } from "@/composables/colors/getGradientStyle";
import { getConRoleChoice } from "@/composables/fields/conrole/getConRoleChoice";
import type { GoodiesLevelValue } from "@/config/packages/setupPackages";
import { ConRole } from "@/config/setupConRoles";
import { setupSponsorLevels } from "@/config/packages/setupSponsorLevels";
import type { ColorsPaletteValue } from "@/config/theme";
import type {
  ConRoleInfo,
  PackageInfo,
  TransformedAttendeeInfo,
} from "@/types/internal";

export function getSponsorLanyardStyle(
  attendeeInfo: TransformedAttendeeInfo | null
): { style: { background: string; color: string } } | {} {
  if (attendeeInfo === null) {
    return {};
  }
  const sponsorItem: PackageInfo<GoodiesLevelValue> | undefined =
    setupSponsorLevels.find(
      (entry: PackageInfo<GoodiesLevelValue>) =>
        entry.value === attendeeInfo.transSponsorChoice
    );
  if (sponsorItem === undefined) {
    return {};
  }
  var [mainColor, altColor]: [ColorsPaletteValue, ColorsPaletteValue] =
    getColorVariants(sponsorItem.color);
  const role: ConRoleInfo = getConRoleChoice(
    attendeeInfo.flags_list,
    attendeeInfo.id
  );
  if (role.value !== ConRole.none) {
    altColor = role.color;
  }
  return getGradientStyle(mainColor, altColor, sponsorItem.textColor);
}
