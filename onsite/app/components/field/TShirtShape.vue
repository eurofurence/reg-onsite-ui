<template>
  <div :class="fieldCSS">
    <label :class="fieldLabelCSS" :for="componentId">T-Shirt Shape</label>
    <SelectButton
      :id="componentId"
      v-model="modelValue"
      :options="getConventionSetup().metadata.forTShirtShapes.list"
      optionValue="value"
      optionLabel="label"
      :allowEmpty="false"
    >
      <template #option="slotProps">
        <div class="flex flex-col">
          {{ slotProps.option.label }}
          <div
            class="flex justify-center"
            style="width: 7.4rem; height: 7.4rem"
          >
            <img
              :class="invertOnDarkMode()"
              :src="getTShirtShapeImageUrl(slotProps.option.value).toString()"
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
import { fieldCSS, fieldLabelCSS } from "@/components/field/common/common";
import { isDarkMode } from "@/composables/theme/isDarkMode";
import type { ModelRef } from "vue";
import { type TShirtShapeValue } from "@/config/metadata/tshirt/metadataForTShirtShapes";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import type { AssetPath, AssetURL } from "@/composables/getAsset";

function invertOnDarkMode(): string {
  if (isDarkMode.value) {
    return "invert t-shirt-img";
  }
  return "t-shirt-img";
}

function getTShirtShapeImageUrl(tshirtShape: TShirtShapeValue): AssetURL {
  const shapeFilePath = `${tshirtShape.toLowerCase()}`;
  return getAsset(`tshirt/${shapeFilePath}.svg` as AssetPath);
}

const modelValue: ModelRef<TShirtShapeValue | undefined> = defineModel<
  TShirtShapeValue | undefined
>({ required: true });

const componentId: string = generateId(useId());
</script>

<style lang="css">
.t-shirt-img {
  width: 6.5rem;
}
</style>
