<template>
  <span>
    <a :href="props.href.toString()">
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
import { isDirty } from "@/composables/dirty/isDirty";
import Button from "@/volt/Button.vue";
import DangerButton from "@/volt/DangerButton.vue";

interface Props {
  href: URL | string;
}
const props: Props = defineProps<Props>();
const emit: CallableFunction = defineEmits(["click"]);
</script>
