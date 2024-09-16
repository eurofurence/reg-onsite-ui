<template>
  <div class="role-field" :class="fieldCSS">
    <label :for="componentId" :class="fieldLabelCSS">Roles</label>
    <div class="flex flex-rows gap-1" :id="componentId">
      <div v-for="item of getConRoleChoiceIternal()" :key="item.value">
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
import { getConRoleChoice } from "@/composables/fields/conrole/getConRoleChoice";
import { ConRole } from "@/config/setupConRoles";
import type { FlagApiValue } from "@/types/external";
import type { ConRoleInfo } from "@/types/internal";
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

function getConRoleChoiceIternal(): ConRoleInfo[] {
  if (modelValue.value === null || regNumber.value === null) {
    return [];
  }
  const conRole: ConRoleInfo = getConRoleChoice(
    modelValue.value,
    regNumber.value
  );
  if (conRole.value === ConRole.none) {
    return [];
  }
  return [conRole];
}

const componentId: string = generateId(useId());
</script>

<style>
.role-field .p-chip {
  color: white;
}
</style>
