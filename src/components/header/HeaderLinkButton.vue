<template>
  <HeaderInteractionButton
    @click="followLink"
    :severity="isDirty ? 'danger' : null"
  >
    <slot></slot>
  </HeaderInteractionButton>
</template>

<script setup lang="ts">
import HeaderInteractionButton from "@/components/header/HeaderInteractionButton.vue";
import { confirmIfDirty } from "@/composables/dirty/confirmIfDirty";
import { isDirty } from "@/composables/dirty/isDirty";

async function followLink(event: MouseEvent) {
  await confirmIfDirty(() => {
    if (props.href === null || props.href === undefined) {
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
</script>
