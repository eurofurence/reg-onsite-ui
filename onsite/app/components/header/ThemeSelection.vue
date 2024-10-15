<template>
  <Dialog
    v-model:visible="isThemeConfigVisible"
    modal
    header="Theme Configuration"
    :style="{ width: '50vw' }"
  >
    <div class="flex flex-col gap-3 m-2">
      <CustomLabeledToggleSwitch
        label="Dark Mode"
        v-model="themeSettings.isDarkMode"
      />
      <CustomLabeledRelativeSlider
        label="Header Size:"
        :withParens="false"
        v-model="themeSettings.headerSize"
        :baseValue="1"
        :step="0.1"
        :min="0.5"
        :max="2"
      />
      <CustomLabeledRelativeSlider
        label="Font Size:"
        :withParens="false"
        v-model="themeSettings.fontSize"
        :baseValue="defaultFontSize"
        :step="1"
        :min="7"
        :max="35"
      />
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
import { defaultUserSettings } from "@/config/theme/common";
import { ref } from "vue";
import type { CookieRef } from "#app";
import {
  watchDialogVisibility,
  ShortcutScope,
} from "@/composables/services/keyboardService";
import type {
  FontSize,
  UserThemeSettings,
} from "@/types/internal/system/theme";

const isThemeConfigVisible: Ref<boolean> = ref(false);
watchDialogVisibility(isThemeConfigVisible, ShortcutScope.dialog_theme);

const defaultFontSize: FontSize = defaultUserSettings.fontSize;
const themeSettings: CookieRef<UserThemeSettings> = useSmartCookie(
  "onsiteTheme",
  defaultUserSettings
);
</script>
