<template>
  <div class="flex flex-col gap-4 pt-4">

    <ItemAssignInputArea ref="inputAreaRef" :toastService="props.toastService" />

    <ItemOperationPanel
      v-model:assignmentMode="assignmentMode"
      v-model:itemCount="itemCount"
      v-model:targetField="targetField"
    />

    <ItemAssignExecuteArea
      :toastService="props.toastService"
      :inputConfig="inputConfig"
      :operationConfig="operationConfig"
    />

  </div>
</template>

<script setup lang="ts">
import ItemAssignInputArea, { type InputConfig } from "@/components/items/ItemAssignInputArea.vue";
import ItemAssignExecuteArea, { type OperationConfig } from "@/components/items/ItemAssignExecuteArea.vue";
import ItemOperationPanel from "@/components/items/ItemOperationPanel.vue";
import type { OnsiteToastService } from "@/composables/services/toastService";
import { useLocalStorage } from "@vueuse/core";
import { computed, ref } from "vue";

interface Props { toastService: OnsiteToastService; }
const props = defineProps<Props>();

const assignmentMode = useLocalStorage<"add" | "set" | "remove">("item-assign-mode", "add");
const itemCount = useLocalStorage<number>("item-assign-count", 1);
const targetField = useLocalStorage<"reservedItems" | "pastItems" | "issuedItems">("item-assign-target-field", "reservedItems");

const inputAreaRef = ref<InstanceType<typeof ItemAssignInputArea> | null>(null);

const defaultInputConfig: InputConfig = {
  inputMode: "standard",
  activeItems: [],
  rawRows: [],
  targetType: "regNumbers",
  regNumbersInput: "",
  selectedGoodieLevels: [],
  selectedRoles: [],
  goodieLevelFilter: "all",
  goodieLevelFilterDate: null,
  goodieLevelFilterN: 10,
  idpGroupsInput: "",
  idpToken: "",
};

const inputConfig = computed<InputConfig>(() => inputAreaRef.value?.config ?? defaultInputConfig);

const operationConfig = computed<OperationConfig>(() => ({
  assignmentMode: assignmentMode.value,
  itemCount: itemCount.value,
  targetField: targetField.value,
}));
</script>
