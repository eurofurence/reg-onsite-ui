<template>
  <span>
    <ConfirmDialog :group="dialogGroup" :breakpoints="getDialogBreakPoints()" />
    <HeaderInteractionButton
      v-bind="$attrs"
      @click="followLink"
      :severity="isDirty ? 'danger' : null"
    >
      <slot></slot>
    </HeaderInteractionButton>
  </span>
</template>

<script setup lang="ts">
import { confirmIfDirty } from "@/composables/dirty/confirmIfDirty";
import { isDirty } from "@/composables/dirty/isDirty";
import { getDialogBreakPoints } from "@/config/theme";
import type { ConfirmServiceMethods } from "@/types/external";

const confirm: ConfirmServiceMethods = useConfirm();

function followLink(event: MouseEvent) {
  confirmIfDirty(confirm, dialogGroup, () => {
    if (props.href === null) {
      emit("click", event);
    } else {
      window.location.href = props.href.toString();
    }
  });
}

interface Props {
  href?: URL | string | null;
}
const props = withDefaults(defineProps<Props>(), { href: null });
const emit: CallableFunction = defineEmits(["click"]);
const componentId: string = generateId(useId());
const dialogGroup: string = `leavePageDialog${componentId}`;
</script>
