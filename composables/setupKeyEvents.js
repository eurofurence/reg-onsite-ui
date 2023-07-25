import { setupEventListener } from "@/composables/setupEventListener";

export function setupKeyEvents(eventName, matchKeyFunction, callFunction, withMod = false) {
    async function onKeyEvent(event) {
        const isMod = event.altKey || event.ctrlKey || event.metaKey;
        if ((isMod && !withMod) || (!isMod && withMod)) {
            return;
        }
        const key = event.key;
        if (matchKeyFunction(key.toLowerCase())) {
            await callFunction(event);
        }
    }
    setupEventListener(window, eventName, onKeyEvent);
}
