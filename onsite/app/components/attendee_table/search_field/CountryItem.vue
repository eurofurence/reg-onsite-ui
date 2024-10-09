<template>
  <div v-if="props.modelValue !== null" class="flex align-items-center gap-2">
    <span :class="getFlagCSSClass(props.modelValue)"></span>
    <span>{{ getCountryName(props.modelValue) }}</span>
  </div>
  <Skeleton v-else />
</template>

<script setup lang="ts">
import { getFlagCSSClass } from "@/composables/fields/country/getFlagCSSClass";
import { getCountryName } from "@/composables/fields/country/getCountryName";
import type { CountryCode } from "@/config/metadata/metadataForCountry";

interface Props {
  modelValue: CountryCode;
}
const props: Props = defineProps<Props>();
</script>
