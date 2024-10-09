<template>
  <span>
    <ConfirmDialog
      :group="confirmService.confirmGroup"
      :breakpoints="getDialogBreakPoints()"
    />
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
import { getDialogBreakPoints } from "@/config/theme/common";
import { OnsiteConfirmService } from "@/composables/services/confirmService";

function followLink(event: MouseEvent) {
  confirmIfDirty(confirmService, () => {
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
const confirmService: OnsiteConfirmService = new OnsiteConfirmService(
  componentId
);
</script>
