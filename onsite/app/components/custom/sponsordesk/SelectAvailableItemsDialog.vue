<template>
  <ConfirmDialog
    header="Available items"
    :group="confirmService.confirmGroup"
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
            :allGoodieItems="getGoodieItemsSubset(props.deskItemSubset)"
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
import { getGoodieItemsSubset } from "@/composables/items/getGoodieItemsSubset";
import type { ModelRef } from "vue";
import { ShortcutScope } from "@/composables/services/keyboardService";
import { OnsiteConfirmService } from "@/composables/services/confirmService";
import type {
  AbstractGoodieValue,
  ConcreteGoodieValue,
} from "@/config/convention";

function run() {
  availableItemsRef.value = modelValue.value;
  confirmService.require(ShortcutScope.confirm_available_items, {
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

const availableItemsRef: Ref<ConcreteGoodieValue[]> = ref<
  ConcreteGoodieValue[]
>([]);

interface Props {
  deskItemSubset: AbstractGoodieValue[];
}
const props: Props = defineProps<Props>();
defineExpose({ run });
const modelValue: ModelRef<ConcreteGoodieValue[]> = defineModel<
  ConcreteGoodieValue[]
>({
  required: true,
});
const componentId: string = generateId(useId());
const confirmService: OnsiteConfirmService = new OnsiteConfirmService(
  componentId
);
</script>

<style lang="css">
.select-items-config {
  font-size: 2rem;
}

.select-items-dialog.p-confirmdialog {
  width: 80vw;
  height: 80vw;
}
</style>
