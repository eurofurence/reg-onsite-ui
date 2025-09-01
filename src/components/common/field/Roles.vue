<template>
  <div class="role-field" :class="fieldCSS">
    <label :for="componentId" :class="fieldLabelCSS">Roles</label>
    <div class="flex flex-rows gap-1" :id="componentId">
      <div
        v-if="modelValue"
        v-for="item of getConRoleMetadataEntriesExclusive(modelValue, regNumber)"
        :key="item.value"
      >
        <Chip
          :class="fieldTextCSS"
          class="h-12 text-white"
          :pt:root:style:background="resolveColorEntry(item)"
          :label="item.label"
          v-bind="$attrs"
        />
      </div>
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
import { getConRoleMetadataEntriesExclusive } from "@/composables/fields/conrole/getConRoleMetadataEntriesExclusive";
import { generateId } from "@/composables/generateId";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { FlagValue } from "@/types/internal/fields";
import Chip from "@/volt/Chip.vue";
import type { ModelRef } from "vue";
import { useId } from "vue";

const modelValue: ModelRef<FlagValue[] | null> = defineModel<
  FlagValue[] | null
>({
  required: true,
});
const regNumber: ModelRef<RegNumber | null> = defineModel<RegNumber | null>(
  "regNumber",
  {
    required: true,
  }
);
const componentId: string = generateId(useId());
</script>
