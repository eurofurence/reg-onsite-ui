<template>
  <Dialog
    v-model:visible="isThemeConfigVisible"
    modal
    header="Theme Configuration"
    :style="{ width: '50vw' }"
  >
    <div class="flex flex-col gap-3 m-2">
      <div class="flex flex-rows gap-2">
        <ToggleSwitch v-model="themeSettings.isDarkMode" />
        <div class="pl-2">Dark Mode</div>
      </div>
      <div class="flex flex-col gap-3">
        <label for="labelHeaderSize">
          Header Size: {{ Math.round(themeSettings.headerSize * 100) }}%
        </label>
        <Slider
          id="labelHeaderSize"
          v-model="themeSettings.headerSize"
          :step="0.1"
          :min="0.5"
          :max="2"
        />
      </div>
      <div class="flex flex-col gap-3">
        <label for="labelFontSize">
          Font Size:
          {{
            Math.round((themeSettings.fontSize * 100) / defaultFontSize)
          }}%</label
        >
        <Slider
          id="labelFontSize"
          v-model.number="themeSettings.fontSize"
          :step="1"
          :min="7"
          :max="35"
        />
      </div>
    </div>
  </Dialog>
  <HeaderInteractionButton
    outlined
    icon="pi pi-cog"
    @click="isThemeConfigVisible = true"
    v-tooltip.bottom="'Theme Settings'"
  />
</template>

<script setup lang="ts">
import { defaultUserSettings } from "@/config/theme";
import type { UserThemeSettings } from "@/types/internal";
import { ref } from "vue";
import type { CookieRef } from "#app";
import { watchDialogVisibility, ShortcutScope } from "@/composables/services/keyboardService";

const isThemeConfigVisible: Ref<boolean> = ref(false);
watchDialogVisibility(isThemeConfigVisible, ShortcutScope.dialog_theme);

const defaultFontSize: number = defaultUserSettings.fontSize;
const themeSettings: CookieRef<UserThemeSettings> = useSmartCookie(
  "onsiteTheme",
  defaultUserSettings
);
</script>
