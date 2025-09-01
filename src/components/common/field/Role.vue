<template>
  <div class="role-field" :class="fieldCSS">
    <label :for="componentId" :class="fieldLabelCSS">Roles</label>
    <div class="flex flex-rows gap-1" :id="componentId">
      <div v-for="item of getConRoleChoiceIternal()" :key="item.value">
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
import { getMainConRoleChoice } from "@/composables/fields/conrole/getMainConRoleChoice";
import { generateId } from "@/composables/generateId";
import { ConRole } from "@/config/metadata/flags/metadataForConRoles";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { FlagValue } from "@/types/internal/fields";
import type { ConRoleInfo } from "@/types/internal/infos";
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

function getConRoleChoiceIternal(): ConRoleInfo[] {
  if (modelValue.value === null || regNumber.value === null) {
    return [];
  }
  const conRole: ConRoleInfo = getMainConRoleChoice(
    modelValue.value,
    regNumber.value
  );
  if (conRole.value === ConRole.no_role) {
    return [];
  }
  return [conRole];
}

const componentId: string = generateId(useId());
</script>
