<template>
  <div :class="fieldCSS">
    <label :for="componentId" :class="fieldLabelCSS">Country</label>
    <div class="relative" v-if="modelValue !== null">
      <Select
        :id="componentId"
        :class="fieldTextCSS"
        class="w-58 h-12"
        v-model="modelValue"
        :options="getConventionSetup().metadata.forCountry.list"
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
    </div>
    <Placeholder width="10rem" :labelId="componentId" v-else />
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
import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import type { CountryCode } from "@/config/metadata/metadataForCountry";
import Select from "@/volt/Select.vue";
import { useId, type ModelRef } from "vue";

const modelValue: ModelRef<CountryCode | null> =
  defineModel<CountryCode | null>({
    required: true,
  });
const componentId: string = generateId(useId());
</script>
