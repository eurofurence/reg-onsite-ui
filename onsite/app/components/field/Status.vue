<template>
  <div class="status-field" :class="fieldCSS">
    <label :for="componentId" :class="fieldLabelCSS">Status</label>
    <div class="pt-[0.1rem]" :id="componentId">
      <Chip
        v-if="modelValue"
        class="w-40"
        :class="fieldTextCSS"
        :pt:root:style:background="resolveColorEntry(getStatusItem(modelValue))"
        :label="getStatusItem(modelValue).label"
        :icon="getStatusItem(modelValue).icon"
        v-bind="$attrs"
      />
      <FieldPlaceholder width="10rem" :labelId="componentId" v-else />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  fieldCSS,
  fieldLabelCSS,
  fieldTextCSS,
  resolveColorEntry,
} from "@/components/field/common/common";
import { getStatusItem } from "@/composables/fields/status/getStatusItem";
import type { ModelRef } from "vue";
import type { AttendeeApiStatusValues } from "@/config/metadata/metadataForStatus";

const modelValue: ModelRef<AttendeeApiStatusValues | null> =
  defineModel<AttendeeApiStatusValues | null>({
    required: true,
  });
const componentId: string = generateId(useId());
</script>

<style lang="css">
.status-field .p-chip {
  color: white;
}
</style>
