<template>
  <div class="role-field" :class="fieldCSS">
    <label :for="componentId" :class="fieldLabelCSS">Roles</label>
    <div class="flex flex-rows gap-1" :id="componentId">
      <div
        v-if="modelValue"
        v-for="item of getAllApiRoleItems(modelValue, regNumber)"
        :key="item.value"
      >
        <Chip
          :class="fieldTextCSS"
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
} from "@/components/field/common";
import { getAllApiRoleItems } from "@/composables/fields/conrole/getAllApiRoleItems";
import type { FlagApiValue } from "@/types/external";
import type { ModelRef } from "vue";

const modelValue: ModelRef<FlagApiValue[] | null> = defineModel<
  FlagApiValue[] | null
>({
  required: true,
});
const regNumber: ModelRef<number | null> = defineModel<number | null>(
  "regNumber",
  {
    required: true,
  }
);
const componentId: string = generateId(useId());
</script>

<style>
.role-field .p-chip {
  color: white;
}
</style>
