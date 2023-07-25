import { ref, computed } from "vue";

export function createSortedListComputedPropertyFromCSV(obj, key1) {
    return ref(
        computed({
            get: () => {
                if (obj.value == null) {
                    return null;
                }
                return obj.value[key1]?.split(",").sort();
            },
            set: (value) => {
                obj.value[key1] = value.sort().join(",");
            },
        }),
    );
}
