import { useCSVList } from "@/composables/useCSVList";
import { computeSelectedValue } from "@/composables/computeSelectedValue";
import { configDealerItems } from "@/ef.config";

export function useDealerChoice(dataRef) {
    return computeSelectedValue(useCSVList(dataRef, "packages"), configDealerItems);
}
