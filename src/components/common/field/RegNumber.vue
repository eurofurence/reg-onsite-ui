<template>
  <div :class="fieldCSS" class="w-24">
    <label :for="componentId" :class="fieldLabelCSS">Registration Number</label>
    <InputNumber
      v-if="modelValue"
      :id="componentId"
      :class="fieldTextCSS + ' text-right'"
      class="h-12"
      :useGrouping="false"
      v-model="modelValue"
      v-bind="$attrs"
    />
    <Placeholder width="6rem" :labelId="componentId" v-else />
  </div>
</template>

<script setup lang="ts">
import {
  fieldCSS,
  fieldLabelCSS,
  fieldTextCSS,
} from "@/components/common/field/common/common";
import Placeholder from "@/components/common/field/Placeholder.vue";
import { generateId } from "@/composables/generateId";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import InputNumber from "@/volt/InputNumber.vue";
import type { ModelRef } from "vue";
import { useId } from "vue";

const modelValue: ModelRef<RegNumber | null> = defineModel<RegNumber | null>({
  required: true,
});
const componentId: string = generateId(useId());
</script>
