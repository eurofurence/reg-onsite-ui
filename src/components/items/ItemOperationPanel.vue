<template>
  <Fieldset legend="Operation" class="p-2">
    <div class="flex flex-wrap gap-4 w-full">
      <Fieldset legend="Mode" class="p-2 flex-1 min-w-0">
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex items-center gap-2">
            <RadioButton v-model="assignmentMode" value="add" inputId="mode-add" />
            <label for="mode-add" class="cursor-pointer">Adding</label>
          </div>
          <div class="flex items-center gap-2">
            <RadioButton v-model="assignmentMode" value="set" inputId="mode-set" />
            <label for="mode-set" class="cursor-pointer">Setting</label>
          </div>
          <div class="flex items-center gap-2">
            <RadioButton v-model="assignmentMode" value="remove" inputId="mode-remove" />
            <label for="mode-remove" class="cursor-pointer">Removing</label>
          </div>
          <div class="flex items-center gap-2 border-l border-surface-200 dark:border-surface-700 pl-4 ml-2">
            <label class="text-sm text-surface-500">{{ modeCountLabel }}</label>
            <InputNumber v-model="itemCount" :min="1" :max="99" showButtons buttonLayout="horizontal" inputClass="w-12 text-center" />
          </div>
        </div>
        <p class="text-xs text-surface-400 mt-2">{{ modeDescription }}</p>
      </Fieldset>
      <Fieldset legend="Target Field" class="p-2 flex-1 min-w-0">
        <ItemTargetFieldSelect v-model="targetField" />
      </Fieldset>
    </div>
  </Fieldset>
</template>

<script setup lang="ts">
import ItemTargetFieldSelect from "@/components/items/ItemTargetFieldSelect.vue";
import Fieldset from "@/volt/Fieldset.vue";
import InputNumber from "@/volt/InputNumber.vue";
import RadioButton from "@/volt/RadioButton.vue";
import { computed } from "vue";

type AssignmentMode = "add" | "set" | "remove";
type AddInfoField = "reservedItems" | "pastItems" | "issuedItems";

const assignmentMode = defineModel<AssignmentMode>("assignmentMode", { required: true });
const itemCount = defineModel<number>("itemCount", { required: true });
const targetField = defineModel<AddInfoField>("targetField", { required: true });

const modeCountLabel = computed(() => {
  if (assignmentMode.value === "add") return "Copies to add:";
  if (assignmentMode.value === "set") return "Target count:";
  return "Copies to remove:";
});

const modeDescription = computed(() => {
  if (assignmentMode.value === "add") return "Appends the specified number of copies of each item to the target list.";
  if (assignmentMode.value === "set") return "Ensures the target list contains exactly the specified number of copies of each item.";
  return "Removes up to the specified number of copies of each item from the target list.";
});
</script>
