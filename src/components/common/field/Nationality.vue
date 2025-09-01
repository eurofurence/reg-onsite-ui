<template>
  <div :class="fieldCSS">
    <label :for="componentId" :class="fieldLabelCSS">Nationality</label>
    <div class="m-px relative" v-if="modelValue !== null">
      <span
        class="absolute top-1/2 -mt-2 text-surface-400 leading-none start-3 z-1"
      >
        <i :class="getFlagCSSClass(modelValue)" />
      </span>
      <InputText
        :id="componentId"
        :class="fieldTextCSS"
        class="w-40 h-12"
        pt:root="ps-10"
        :modelValue="getCountryName(modelValue)"
        v-bind="$attrs"
      />
    </div>
    <div v-else>
      <Placeholder width="10rem" :labelId="componentId" />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  fieldCSS,
  fieldLabelCSS,
  fieldTextCSS,
} from "@/components/common/field/common/common";
import Placeholder from "@/components/common/field/Placeholder.vue";
import { getCountryName } from "@/composables/fields/country/getCountryName";
import { getFlagCSSClass } from "@/composables/fields/country/getFlagCSSClass";
import { generateId } from "@/composables/generateId";
import type { CountryCode } from "@/config/metadata/metadataForCountry";
import InputText from "@/volt/InputText.vue";
import type { ModelRef } from "vue";
import { useId } from "vue";

const modelValue: ModelRef<CountryCode | null> =
  defineModel<CountryCode | null>({
    required: true,
  });
const componentId: string = generateId(useId());
</script>
