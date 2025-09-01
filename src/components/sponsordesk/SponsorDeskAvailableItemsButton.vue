<template>
  <Dialog
    header="Configure Available Items"
    v-model:visible="dialogVisibleForSettingsRef"
  >
    <div class="flex flex-col flex-grow">
      <div class="flex flex-grow">
        <SponsorDeskAvailableItems
          v-model="availableItemsRef"
          :allGoodieItems="getGoodieItemsSubset(props.deskItemSubset)"
        />
      </div>
    </div>
  </Dialog>

  <Button class="h-10" @click="$emit('onSelectAvailable', $event)">
    Select Available
  </Button>
  <Button
    icon="pi pi-ellipsis-v"
    class="h-10 aspect-square h-full"
    @click="onToggleMenu"
    aria-haspopup="true"
    aria-controls="overlay_menu"
  />
  <Menu ref="menuRef" id="overlay_menu" :model="menuProps" :popup="true" />
</template>

<script setup lang="ts">
import SponsorDeskAvailableItems from "@/components/sponsordesk/SponsorDeskAvailableItems.vue";
import { getGoodieItemsSubset } from "@/composables/items/getGoodieItemsSubset";
import {
  ShortcutScope,
  watchDialogVisibility,
} from "@/composables/services/keyboardService";
import type {
  AbstractGoodieValue,
  ConcreteGoodieValue,
} from "@/config/convention";
import Button from "@/volt/Button.vue";
import Dialog from "@/volt/Dialog.vue";
import Menu from "@/volt/Menu.vue";
import type { MenuItem } from "primevue/menuitem";
import { type ModelRef, ref, type Ref, useTemplateRef } from "vue";

const dialogVisibleForSettingsRef: Ref<boolean> = ref<boolean>(false);
watchDialogVisibility(
  dialogVisibleForSettingsRef,
  ShortcutScope.dialog_regdesk_settings
);

const menuRef = useTemplateRef<typeof Menu>("menuRef");

const menuProps: MenuItem[] = [
  {
    label: "Configure",
    icon: "pi pi-cog",
    disabled: true, // FIXME
    command: () => {
      dialogVisibleForSettingsRef.value = true;
    },
  },
  {
    label: "Show comment field",
    icon: "pi pi-pencil",
    command: () => {
      emit("onShowCommentField", null);
    },
  },
];

function onToggleMenu(event: Event) {
  if (menuRef.value) {
    menuRef.value.toggle(event);
  }
}

const availableItemsRef: ModelRef<ConcreteGoodieValue[]> = defineModel<
  ConcreteGoodieValue[]
>({
  required: true,
});
interface Props {
  deskItemSubset: AbstractGoodieValue[];
}
const props: Props = defineProps<Props>();
const emit = defineEmits(["onSelectAvailable", "onShowCommentField"]);
</script>
