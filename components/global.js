import { reactive, computed } from "vue";

export const globalState = reactive({
    userName: null,

    isAdmin: false,
    isDDWorker: false,
    isLoggedIn: false,

    dirtyTracker: reactive({}),
    isDirty: computed(() => {
        const dirtyTracker = globalState.dirtyTracker;
        for (const key in dirtyTracker) {
            if (dirtyTracker[key] === true) {
                return true;
            }
        }
        return false;
    }),
});
