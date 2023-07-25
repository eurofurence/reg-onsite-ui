import { ref, computed } from "vue";

export function createRef(obj, property) {
    return ref(
        computed({
            get: () => obj.value?.[property],
            set: (value) => {
                obj.value[property] = value;
            },
        }),
    );
}

export function createIntRef(obj, property) {
    return ref(
        computed({
            get: () => obj.value?.[property],
            set: (value) => {
                obj.value[property] = parseInt(value);
            },
        }),
    );
}
