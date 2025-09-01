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
              class="w-[6.5rem]"
              :class="invertOnDarkMode()"
              :src="getTShirtShapeImageUrl(slotProps.option.value)"
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
import {
  fieldCSS,
  fieldLabelCSS,
} from "@/components/common/field/common/common";
import { generateId } from "@/composables/generateId";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import { invertOnDarkMode } from "@/composables/theme/isDarkMode";
import {
  TShirtShape,
  type TShirtShapeValue,
} from "@/config/metadata/tshirt/metadataForTShirtShapes";
import imgContoured from "@/pages/assets/tshirt/contoured.svg";
import imgRegular from "@/pages/assets/tshirt/regular.svg";
import SelectButton from "@/volt/SelectButton.vue";
import type { ModelRef } from "vue";
import { useId } from "vue";

function getTShirtShapeImageUrl(tshirtShape: TShirtShapeValue): string {
  if (tshirtShape === TShirtShape.contoured) {
    return imgContoured;
  }
  return imgRegular;
}

const modelValue: ModelRef<TShirtShapeValue | undefined> = defineModel<
  TShirtShapeValue | undefined
>({ required: true });

const componentId: string = generateId(useId());
</script>
