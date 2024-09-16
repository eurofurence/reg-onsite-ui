<template>
  <div :class="fieldCSS">
    <label :for="componentId" :class="fieldLabelCSS">Country</label>
    <IconField v-if="modelValue !== null">
      <InputIcon :class="getFlagCSSClass(modelValue)" />
      <Select
        :id="componentId"
        :class="fieldTextCSS"
        class="w-56"
        v-model="modelValue"
        :options="setupCountries"
        optionValue="value"
        optionLabel="label"
        v-bind="$attrs"
      >
        <template #value="slotProps">
          <div>
            <span :class="getFlagCSSClass(slotProps.value)" class="mr-2"></span>
            <span :class="fieldTextCSS">{{
              getCountryName(slotProps.value)
            }}</span>
          </div>
        </template>
        <template #option="slotProps">
          <div>
            <span
              :class="getFlagCSSClass(slotProps.option.value)"
              class="mr-2"
            ></span>
            <span :class="fieldTextCSS">{{
              getCountryName(slotProps.option.value)
            }}</span>
          </div>
        </template>
      </Select>
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
import { setupCountries } from "@/config/setupCountries";
import type { CountryCode } from "@/config/setupCountries";
import type { ModelRef } from "vue";

const modelValue: ModelRef<CountryCode | null> =
  defineModel<CountryCode | null>({
    required: true,
  });
const componentId: string = generateId(useId());
</script>
