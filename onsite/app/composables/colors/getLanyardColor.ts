import { getConRoleChoice } from "@/composables/fields/conrole/getConRoleChoice";
import { computePackageChoice } from "@/composables/fields/packages/computePackageChoice";
import type { GoodiesLevelValue } from "@/config/packages/setupPackages";
import { ConRole } from "@/config/setupConRoles";
import { setupSponsorLevels } from "@/config/packages/setupSponsorLevels";
import { ColorsPalette, type ColorsPaletteValue } from "@/config/theme";
import type {
  ConRoleInfo,
  PackageInfo,
  TransformedAttendeeInfo,
} from "@/types/internal";
import type { WritableComputedRef } from "vue";

export function getLanyardColor(
  attendeeInfo: TransformedAttendeeInfo
): ColorsPaletteValue {
  const ConRoleInfo: ConRoleInfo = getConRoleChoice(
    attendeeInfo.flags_list,
    attendeeInfo.id
  );
  if (ConRoleInfo.value !== ConRole.none) {
    return ConRoleInfo.color;
  }
  const sponsorChoice: WritableComputedRef<GoodiesLevelValue | null> =
    computePackageChoice(ref(attendeeInfo.packages_list), setupSponsorLevels);
  const sponsorItem: PackageInfo<GoodiesLevelValue> | undefined =
    setupSponsorLevels.find(
      (entry: PackageInfo<GoodiesLevelValue>) =>
        entry.value === sponsorChoice.value
    );
  if (sponsorItem === undefined) {
    return ColorsPalette.inverted_text;
  }
  return sponsorItem.color;
}
