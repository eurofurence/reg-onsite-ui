<template>
  <div class="flex flex-rows gap-3">
    <ToggleSwitch v-model="modelValue" />
    <label :for="componentId">{{ props.label }}</label>
  </div>
</template>

<script setup lang="ts">
import type { ModelRef } from "vue";

interface Props {
  label: string;
}
const props: Props = defineProps<Props>();

defineOptions({
  inheritAttrs: false,
});

const modelValue: ModelRef<boolean> = defineModel<boolean>({
  required: true,
});
const componentId: string = generateId(useId());
</script>
