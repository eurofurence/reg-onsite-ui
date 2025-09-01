<template>
  <div :class="fieldCSS">
    <label :for="componentId" :class="fieldLabelCSS">Spoken Languages</label>
    <div class="m-px" v-if="spokenLanguagesRef">
      <MultiSelect
        :id="componentId"
        v-model="spokenLanguagesRef"
        :class="fieldTextCSS"
        class="h-12 min-w-48"
        pt:dropdown:class="hidden"
        pt:header:class="hidden"
        :options="getConventionSetup().metadata.forLanguage.list"
        display="chip"
        v-bind="$attrs"
        optionLabel="label"
        optionValue="value"
        dropdownIcon="hidden"
        fluid
      >
        <template #dropdownicon />
        <template #option="slotProps">
          <i
            v-if="isRegistrationLanguage(slotProps.option.value)"
            :class="getLanguageFlagCSSClass(slotProps.option.value)"
          ></i>
          {{ slotProps.option.label }}
        </template>
        <template #chip="slotProps">
          <Chip :pt:root:style:background="getLanguageColor(slotProps.value)">
            <i
              v-if="isRegistrationLanguage(slotProps.value)"
              :class="getLanguageFlagCSSClass(slotProps.value)"
            ></i>
            {{
              getConventionSetup().metadata.forLanguage.record[slotProps.value]
                ?.label || slotProps.value
            }}
          </Chip>
        </template>
      </MultiSelect>
    </div>
    <div v-else>
      <Placeholder width="12rem" :labelId="componentId" />
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
import { resolveColor } from "@/composables/colors/resolveColor";
import { getFlagCSSClass } from "@/composables/fields/country/getFlagCSSClass";
import { generateId } from "@/composables/generateId";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import { ColorsPalette } from "@/composables/theme/colors";
import type { CountryCode } from "@/config/metadata/metadataForCountry";
import { type LanguageCode } from "@/config/metadata/metadataForLanguage";
import Chip from "@/volt/Chip.vue";
import MultiSelect from "@/volt/MultiSelect.vue";
import type { ModelRef } from "vue";
import { useId } from "vue";

function isRegistrationLanguage(value: LanguageCode): boolean {
  if (
    registrationLanguageRef.value &&
    registrationLanguageRef.value.split("-")[0] === value
  ) {
    return true;
  }
  return false;
}

function getLanguageFlagCSSClass(value: LanguageCode): string | null {
  if (value == "en") {
    return getFlagCSSClass("GB" as CountryCode);
  }
  return getFlagCSSClass(value as unknown as CountryCode);
}

function getLanguageColor(value: LanguageCode): string | null {
  if (isRegistrationLanguage(value)) {
    return resolveColor(ColorsPalette.primary_500);
  }
  return null;
}

const spokenLanguagesRef: ModelRef<LanguageCode[] | null> = defineModel<
  LanguageCode[] | null
>({
  required: true,
});
const registrationLanguageRef: ModelRef<string | null | undefined> =
  defineModel<string | null | undefined>("registrationLanguage");
const componentId: string = generateId(useId());
</script>
