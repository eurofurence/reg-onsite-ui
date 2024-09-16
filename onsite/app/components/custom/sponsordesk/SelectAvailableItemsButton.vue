<template>
  <CustomSponsordeskSelectAvailableItemsDialog
    v-model="availableItemsRef"
    ref="availableItemsDialogRef"
    v-bind:deskItemSubset="props.deskItemSubset"
  />
  <SplitButton
    label="Select Available"
    @click="$emit('selectAvailable', $event)"
    :model="selectAvailableDropdown"
    outlined
  />
</template>

<script setup lang="ts">
import type SelectAvailableItemsDialog from "@/components/custom/sponsordesk/SelectAvailableItemsDialog.vue";
import type {
  AbstractTrinketValue,
  ConcreteTrinketValue,
} from "@/setupEFIteration";
import type { MenuItem } from "primevue/menuitem";
import type { ModelRef } from "vue";

const availableItemsDialogRef = useTemplateRef<
  typeof SelectAvailableItemsDialog
>("availableItemsDialogRef");

const selectAvailableDropdown: MenuItem[] = [
  {
    label: "Configure",
    icon: "pi pi-cog",
    command: () => {
      if (availableItemsDialogRef.value) {
        availableItemsDialogRef.value.run();
      }
    },
  },
];

const availableItemsRef: ModelRef<ConcreteTrinketValue[]> = defineModel<
  ConcreteTrinketValue[]
>({
  required: true,
});
interface Props {
  deskItemSubset: AbstractTrinketValue[];
}
const props: Props = defineProps<Props>();
const emit: CallableFunction = defineEmits(["selectAvailable"]);
</script>
