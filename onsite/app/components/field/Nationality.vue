<template>
  <div :class="fieldCSS">
    <label :for="componentId" :class="fieldLabelCSS">Country</label>
    <IconField v-if="modelValue !== null">
      <InputIcon :class="getFlagCSSClass(modelValue)" />
      <InputText
        :id="componentId"
        :class="fieldTextCSS"
        class="w-40"
        :modelValue="getCountryName(modelValue)"
        v-bind="$attrs"
      />
    </IconField>
    <FieldPlaceholder width="10rem" :labelId="componentId" v-else />
  </div>
</template>

<script setup lang="ts">
import {
  fieldCSS,
  fieldLabelCSS,
  fieldTextCSS,
} from "@/components/field/common";
import { getCountryName } from "@/composables/fields/country/getCountryName";
import { getFlagCSSClass } from "@/composables/fields/country/getFlagCSSClass";
import type { CountryCode } from "@/config/setupCountries";
import type { ModelRef } from "vue";

const modelValue: ModelRef<CountryCode | null> =
  defineModel<CountryCode | null>({
    required: true,
  });
const componentId: string = generateId(useId());
</script>
