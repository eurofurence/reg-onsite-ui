import { useCSVList } from "@/composables/useCSVList";
import { computeSelectedValue, getSelectedValue } from "@/composables/computeSelectedValue";
import { configSponsorItems } from "@/ef.config";
import { convertListToMap } from "@/composables/convertListToMap";

const sponsorMap = convertListToMap(configSponsorItems);

export function getSponsor(data, customSponsorItems = null) {
    const packageValueList = data.packages.split(",");
    return getSelectedValue(packageValueList, customSponsorItems || configSponsorItems);
}

export function getSponsorItem(value) {
    return sponsorMap[value];
}

export function useSponsor(dataRef, customSponsorItems = null) {
    const packageList = useCSVList(dataRef, "packages");
    return computeSelectedValue(packageList, customSponsorItems || configSponsorItems);
}
