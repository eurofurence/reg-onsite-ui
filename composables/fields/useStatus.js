import { configStatusItems } from "@/ef.config";
import { convertListToMap } from "@/composables/convertListToMap";
import { getColorVariants } from "@/composables/getColorVariants";

const propertyMap = convertListToMap(configStatusItems);

export function getStatusItem(value) {
    return propertyMap[value];
}

export function useStatusStyle(status) {
    if (status !== "checked in") {
        return {};
    }
    const [mainColor, altColor] = getColorVariants(propertyMap[status].color, 400);
    return {
        style: {
            background: `linear-gradient(110deg, var(${mainColor}) 50%, var(${altColor}) 50%)`,
            color: "white",
        },
    };
}
