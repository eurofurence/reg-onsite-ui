<template>
    <Dialog v-model:visible="isThemeConfigVisible" modal header="Theme Configuration" :style="{ width: '50vw' }">
        <div class="flex flex-column gap-3 m-2">
            <div class="flex flex-rows gap-2 align-items-center">
                <InputSwitch v-model="themeSettings.isDarkMode" />
                <div class="pl-2">Dark Mode</div>
            </div>
            <div class="flex flex-column gap-3">
                <label for="labelHeaderSize"> Header Size: {{ parseInt(themeSettings.headerSize * 100) }}% </label>
                <Slider id="labelHeaderSize" v-model="themeSettings.headerSize" :step="0.1" :min="0.5" :max="2" />
            </div>
            <div class="flex flex-column gap-3">
                <label for="labelFontSize">
                    Font Size:
                    {{ parseInt((themeSettings.fontSize * 100) / defaultFontSize) }}%</label
                >
                <Slider id="labelFontSize" v-model.number="themeSettings.fontSize" :step="1" :min="7" :max="35" />
            </div>
        </div>
    </Dialog>
    <Button class="theme-config-button" icon="pi pi-cog" @click="isThemeConfigVisible = true" v-tooltip.bottom="'Theme Settings'" />
</template>

<script setup>
import { ref, watch } from "vue";
import { usePrimeVue } from "primevue/config";

import Button from "primevue/button";
import InputSwitch from "primevue/inputswitch";
import Dialog from "primevue/dialog";
import Slider from "primevue/slider";

import { useCookieStruct } from "@/composables/useCookieStruct";
import { configThemeCookie } from "@/ef.config";

const isThemeConfigVisible = ref(false);
const defaultFontSize = configThemeCookie.fontSize;
const themeSettings = useCookieStruct("onsiteTheme", configThemeCookie);

// Managing dark mode
// eslint-disable-next-line no-undef
const PrimeVue = usePrimeVue();
function setTheme() {
    if (themeSettings.value.isDarkMode) {
        PrimeVue.changeTheme("lara-light-ef", "lara-dark-ef", "theme-link", () => {});
    } else {
        PrimeVue.changeTheme("lara-dark-ef", "lara-light-ef", "theme-link", () => {});
    }
    document.documentElement.style.fontSize = `${themeSettings.value.fontSize}px`;
    document.documentElement.style.setProperty("--header-size", themeSettings.value.headerSize);
}
watch(themeSettings.value, setTheme, { immediate: true });

import { debugState } from "@/components/debug";
debugState["ThemeSelectionElement"] = {
    isThemeConfigVisible: isThemeConfigVisible,
};
</script>

<style>
.theme-config-button {
    width: calc(var(--header-size) * 50px);
    height: calc(var(--header-size) * 50px);
    padding-left: 5px;
    padding-right: 5px;
    --refresh: v-bind("themeSettings.headerSize");
}

.theme-config-button > .pi {
    font-size: calc(var(--header-size) * 20px);
}

.theme-config-button.p-button.p-button-icon-only {
    width: calc(var(--header-size) * 50px);
    height: calc(var(--header-size) * 50px);
    font-size: calc(var(--header-size) * 50px);
    padding: 5px 0;
}
</style>
