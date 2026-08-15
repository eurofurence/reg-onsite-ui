<template>
  <span>
    <a :href="props.href.toString()" @click="onClick">
      <DangerButton v-bind="$attrs" v-if="isDirty">
        <slot></slot>
      </DangerButton>
      <Button v-bind="$attrs" v-else>
        <slot></slot>
      </Button>
    </a>
  </span>
</template>

<script setup lang="ts">
import { confirmIfDirty } from "@/composables/dirty/confirmIfDirty";
import { isDirty } from "@/composables/dirty/isDirty";
import Button from "@/volt/Button.vue";
import DangerButton from "@/volt/DangerButton.vue";

interface Props {
  href: URL | string;
}
const props: Props = defineProps<Props>();
const emit: CallableFunction = defineEmits(["click"]);

async function onClick(event: MouseEvent): Promise<void> {
  event.preventDefault();
  await confirmIfDirty(() => {
    window.location.href = props.href.toString();
  });
}
</script>
