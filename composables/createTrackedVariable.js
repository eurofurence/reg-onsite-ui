import { ref, computed } from "vue";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function serialize(value, params) {
    return JSON.stringify(value);
}

export function createTrackedVariable(reference, params) {
    const storedJSON = ref(serialize(reference.value, params));
    return ref(
        computed({
            get: () => {
                const currentJSON = serialize(reference.value, params);
                return storedJSON.value !== currentJSON;
            },
            set: (value) => {
                if (value) {
                    storedJSON.value = null;
                } else {
                    storedJSON.value = serialize(reference.value, params);
                }
            },
        }),
    );
}
