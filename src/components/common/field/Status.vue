<template>
  <div class="status-field" :class="fieldCSS">
    <label :for="componentId" :class="fieldLabelCSS">Status</label>
    <div class="m-px" :id="componentId" v-if="modelValue">
      <Chip
        class="w-40 h-12 text-white"
        :class="fieldTextCSS"
        :pt:root:style:background="resolveColorEntry(getStatusItem(modelValue))"
        :label="getStatusItem(modelValue).label"
        :icon="getStatusItem(modelValue).icon"
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
  resolveColorEntry,
} from "@/components/common/field/common/common";
import Placeholder from "@/components/common/field/Placeholder.vue";
import { getStatusItem } from "@/composables/fields/status/getStatusItem";
import { generateId } from "@/composables/generateId";
import type { AttendeeApiStatusValues } from "@/config/metadata/metadataForStatus";
import Chip from "@/volt/Chip.vue";
import type { ModelRef } from "vue";
import { useId } from "vue";

const modelValue: ModelRef<AttendeeApiStatusValues | null> =
  defineModel<AttendeeApiStatusValues | null>({
    required: true,
  });
const componentId: string = generateId(useId());
</script>
