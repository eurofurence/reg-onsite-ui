<template>
  <ConfirmDialog
    header="Available items"
    :group="availableDialogGroupId"
    class="select-items-dialog"
  >
    <template #message="slotProps">
      <div
        class="select-items-config flex flex-col"
        style="width: 100%; height: 100%"
      >
        <div class="flex flex-grow">
          <PanelSponsordeskAvailableItems
            v-model="availableItemsRef"
            :allTrinketItems="getTrinketItemsSubset(props.deskItemSubset)"
          />
        </div>
        <div>
          <p>{{ slotProps.message.message }}</p>
        </div>
      </div>
    </template>
  </ConfirmDialog>
</template>

<script setup lang="ts">
import { getTrinketItemsSubset } from "@/composables/items/getTrinketItemsSubset";
import type {
  AbstractTrinketValue,
  ConcreteTrinketValue,
} from "@/setupEFIteration";
import type { ConfirmServiceMethods } from "@/types/external";
import { useConfirm } from "primevue/useconfirm";
import type { ModelRef } from "vue";

const confirm: ConfirmServiceMethods = useConfirm();

function run() {
  availableItemsRef.value = modelValue.value;
  confirm.require({
    group: availableDialogGroupId,
    header: "Configure Available Items",
    message: "Do you want to save the changes to the available items?",
    rejectProps: {
      label: "Cancel",
      icon: "pi pi-times",
      outlined: true,
    },
    acceptProps: {
      label: "Save",
      icon: "pi pi-check",
    },
    accept: () => {
      modelValue.value = availableItemsRef.value;
    },
    reject: () => {},
  });
}

const availableItemsRef: Ref<ConcreteTrinketValue[]> = ref<
  ConcreteTrinketValue[]
>([]);

interface Props {
  deskItemSubset: AbstractTrinketValue[];
}
const props: Props = defineProps<Props>();
defineExpose({ run });
const modelValue: ModelRef<ConcreteTrinketValue[]> = defineModel<
  ConcreteTrinketValue[]
>({
  required: true,
});
const componentId: string = generateId(useId());
const availableDialogGroupId: string = `availableDialog${componentId}`;
</script>

<style>
.select-items-config {
  font-size: 2rem;
}

.select-items-dialog.p-confirmdialog {
  width: 80vw;
  height: 80vw;
}
</style>
