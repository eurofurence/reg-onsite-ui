<template>
  <div :class="fieldCSS">
    <label :class="fieldLabelCSS" :for="componentId">T-Shirt Shape</label>
    <SelectButton
      :id="componentId"
      v-model="modelValue"
      :options="['Regular', 'Contoured']"
      :allowEmpty="false"
    >
      <template #option="slotProps">
        <div class="flex flex-col">
          {{ slotProps.option }}
          <div
            class="flex justify-center"
            style="width: 7.4rem; height: 7.4rem"
          >
            <img
              :class="invertOnDarkMode()"
              :src="getTShirtShapeImageUrl(slotProps.option)"
              :placeholder="slotProps.option"
              unoptimized
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
    return "invert t-shirt-img";
  }
  return "t-shirt-img";
}

const nuxtConfig = useRuntimeConfig();

function getTShirtShapeImageUrl(tshirtShape: TShirtShapeValue): string {
  const shapeFilePath = `${tshirtShape.toLowerCase()}`;
  const baseUrl = nuxtConfig.app.baseURL;
  return `${baseUrl}/tshirt/${shapeFilePath}.svg`;
}

const modelValue: ModelRef<TShirtShapeValue | undefined> = defineModel<
  TShirtShapeValue | undefined
>({ required: true });

const componentId: string = generateId(useId());
</script>

<style>
.t-shirt-img {
  width: 6.5rem;
}
</style>
