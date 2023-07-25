import { getAllAttendeesForFilter } from "@/composables/searchAttendees";

export async function cachedGetAllAttendeesForFilter(mode, cacheRef, globalState, toast, filterDict, globalSearchColumns, sortOrder) {
    const hashKey = "key_" + JSON.stringify(filterDict);
    if (mode !== "force_query" && hashKey in cacheRef.value) {
        return cacheRef.value[hashKey];
    }
    const result = await getAllAttendeesForFilter(globalState, toast, filterDict, globalSearchColumns, sortOrder);
    if (result.length <= 1) {
        cacheRef.value[hashKey] = result;
    }
    return result;
}
