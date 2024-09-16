<template>
  <div :class="fieldCSS">
    <label :class="fieldLabelCSS" :for="componentId">T-Shirt Shape</label>
    <SelectButton
      :id="componentId"
      v-model="modelValue"
      :options="['Regular', 'Contoured']"
      :unselectable="true"
    >
      <template #option="slotProps">
        <div class="flex flex-col">
          {{ slotProps.option }}
          <div
            class="flex align-items-center justify-content-center"
            style="width: 7.4rem; height: 7.4rem"
          >
            <NuxtImg
              :class="invertOnDarkMode()"
              width="6rem"
              :src="getTShirtShapeImageUrl(slotProps.option)"
              placeholder
            />
          </div>
        </div>
      </template>
    </SelectButton>
  </div>
</template>

<script setup lang="ts">
import { fieldCSS, fieldLabelCSS } from "@/components/field/common";
import { isDarkMode } from "@/composables/theme/isDarkMode";
import type { TShirtShapeValue } from "@/config/setupTShirtShapes";
import type { ModelRef } from "vue";

function invertOnDarkMode(): string {
  if (isDarkMode.value) {
    return "invert";
  }
  return "";
}
document.querySelector("html");
function getTShirtShapeImageUrl(tshirtShape: TShirtShapeValue): string {
  const shapeFilePath = `${tshirtShape.toLowerCase()}`;
  return `/tshirt/${shapeFilePath}.svg`;
}
const modelValue: ModelRef<TShirtShapeValue | undefined> = defineModel<
  TShirtShapeValue | undefined
>({ required: true });
const componentId: string = generateId(useId());
</script>
