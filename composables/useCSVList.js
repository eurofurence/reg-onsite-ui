import { computed } from "vue";

export function useCSVList(obj, key1) {
    return computed({
        get: () => {
            return obj.value[key1]?.split(",").sort();
        },
        set: (value) => {
            obj.value[key1] = value.sort().join(",");
        },
    });
}
