import { useCSVList } from "@/composables/useCSVList";
import { computeSelectedValue, getSelectedValue } from "@/composables/computeSelectedValue";
import { configConbookItems } from "@/ef.config";

export function getConbook(data) {
    const flagsValueList = data.flags.split(",");
    return getSelectedValue(flagsValueList, configConbookItems);
}

export function useConbook(dataRef) {
    return computeSelectedValue(useCSVList(dataRef, "flags"), configConbookItems);
}
