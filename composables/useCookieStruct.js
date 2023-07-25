import { watch, ref } from "vue";

function serialize(data) {
    return btoa(JSON.stringify(data));
}

function deserialize(data) {
    return JSON.parse(atob(data));
}

// https://github.com/nuxt/nuxt/issues/22001
export function useCookieStruct(name, defaultStruct) {
    // eslint-disable-next-line no-undef
    const cookie = useCookie(name, { default: () => serialize(defaultStruct) });
    const cookieData = ref(deserialize(cookie.value));
    watch(
        cookieData.value,
        async () => {
            cookie.value = serialize(cookieData.value);
        },
        { immediate: true },
    );
    return cookieData;
}
