import { configRoleItems, configSponsorItems } from "@/ef.config";
import { getColorVariants } from "@/composables/getColorVariants";

export function useLanyardStyle(sponsorValue, rolesList) {
    const sponsorItem = configSponsorItems.find((item) => item.value == sponsorValue);
    return () => {
        var [mainColor, altColor] = getColorVariants(sponsorItem.color);
        if (rolesList.length > 0) {
            const highestRoleValue = rolesList.slice(-1)[0];
            const highestRoleItem = configRoleItems.find((item) => item.value == highestRoleValue);
            altColor = `--${highestRoleItem.color}`;
        }
        return {
            style: {
                background: `linear-gradient(110deg, var(${mainColor}) 50%, var(${altColor}) 50%)`,
                color: sponsorItem.textColor,
            },
        };
    };
}
