<template>
  <div class="spoken-languages-field" :class="fieldCSS">
    <label :for="componentId" :class="fieldLabelCSS">Spoken Languages</label>
    <MultiSelect
      :id="componentId"
      v-model="spokenLanguagesRef"
      :class="fieldTextCSS"
      :options="getConventionSetup().metadata.forLanguage.list"
      display="chip"
      v-bind="$attrs"
      optionLabel="label"
      optionValue="value"
      dropdownIcon="hidden"
      fluid
      v-if="spokenLanguagesRef"
    >
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
    <FieldPlaceholder width="12rem" :labelId="componentId" v-else />
  </div>
</template>

<script setup lang="ts">
import {
  fieldCSS,
  fieldLabelCSS,
  fieldTextCSS,
} from "@/components/field/common/common";
import { resolveColor } from "@/composables/colors/resolveColor";
import { getFlagCSSClass } from "@/composables/fields/country/getFlagCSSClass";
import { type LanguageCode } from "@/config/metadata/metadataForLanguage";
import type { ModelRef } from "vue";
import type { CountryCode } from "@/config/metadata/metadataForCountry";
import { ColorsPalette } from "@/composables/theme/colors";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";

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

<style lang="css">
.spoken-languages-field .p-icon.p-chip-remove-icon {
  display: none;
}

.spoken-languages-field .p-chip:has(.p-chip-remove-icon) {
  padding-right: 0.75rem;
}

.spoken-languages-field .p-autocomplete-input-chip {
  display: none;
}
</style>
