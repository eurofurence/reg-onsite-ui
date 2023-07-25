import { FilterService } from "primevue/api";

export function updateSearchState(filterDict) {
    return JSON.stringify(filterDict);
}

export function hasSearchStateChanged(curFilterDict, filterState) {
    if (filterState === null) {
        // Initial search
        return true;
    }
    const oldFilterDict = JSON.parse(filterState);
    for (const key in curFilterDict) {
        const curFilterMeta = curFilterDict[key];
        const oldFilterMeta = oldFilterDict[key];
        const filterRelation = FilterService.filters[curFilterMeta.matchMode];
        if (curFilterMeta.matchMode !== oldFilterMeta.matchMode) {
            return true;
        }
        if (curFilterMeta.value === null && oldFilterMeta.value !== null) {
            return true;
        }
        if (curFilterMeta.value !== null && oldFilterMeta.value === null) {
            return true;
        }
        const curValueAsJSON = JSON.stringify(curFilterMeta.value);
        if (curValueAsJSON[0] !== '"') {
            if (curValueAsJSON !== JSON.stringify(oldFilterMeta.value)) {
                return true;
            }
        } else {
            if (!filterRelation(curFilterMeta.value, oldFilterMeta.value)) {
                return true;
            }
        }
        if (key === "global") {
            const curNum = Number(curFilterMeta.value);
            const oldNum = Number(oldFilterMeta.value);
            if (isNaN(curNum) || isNaN(oldNum)) {
                if (isNaN(curNum) !== isNaN(oldNum)) {
                    return true;
                }
                continue;
            }
            if (curNum !== oldNum) {
                return true;
            }
        }
    }
    return false;
}
