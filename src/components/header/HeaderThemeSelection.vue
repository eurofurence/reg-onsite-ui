<template>
  <Dialog
    v-model:visible="isThemeConfigVisible"
    modal
    header="Theme Configuration"
    :style="{ width: '50vw' }"
  >
    <div class="flex flex-col gap-3 m-2">
      <LabeledToggleSwitch
        label="Dark Mode"
        v-model="themeSettings.isDarkMode"
      />
      <LabeledRelativeSlider
        label="Header Size:"
        :withParens="false"
        v-model="themeSettings.headerSize"
        :baseValue="1"
        :step="0.1"
        :min="0.5"
        :max="2"
      />
      <LabeledRelativeSlider
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
    class="aspect-square"
    outlined
    @click="isThemeConfigVisible = true"
    v-tooltip.bottom="'Theme Settings'"
  >
    <i class="pi pi-cog" />
  </HeaderInteractionButton>
</template>

<script setup lang="ts">
import LabeledRelativeSlider from "@/components/common/LabeledRelativeSlider.vue";
import LabeledToggleSwitch from "@/components/common/LabeledToggleSwitch.vue";
import HeaderInteractionButton from "@/components/header/HeaderInteractionButton.vue";
import {
  ShortcutScope,
  watchDialogVisibility,
} from "@/composables/services/keyboardService";
import { themeSettings } from "@/composables/theme/initTheme";
import { defaultUserSettings } from "@/config/theme/common";
import type { FontSize } from "@/types/internal/system/theme";
import Dialog from "@/volt/Dialog.vue";
import { ref, type Ref } from "vue";

const isThemeConfigVisible: Ref<boolean> = ref(false);
watchDialogVisibility(isThemeConfigVisible, ShortcutScope.dialog_theme);

const defaultFontSize: FontSize = defaultUserSettings.fontSize;
</script>
