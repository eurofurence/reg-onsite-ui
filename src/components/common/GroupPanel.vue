<template>
  <Fieldset class="pl-1 pr-1 pb-1 mx-1">
    <template #legend>
      <span class="text-primary mr-2 pi" :class="props.icon"> </span>
      <span class="text-primary font-bold text-lg">{{ props.label }}</span>
    </template>
    <slot />
  </Fieldset>
</template>

<script setup lang="ts">
import Fieldset from "@/volt/Fieldset.vue";
interface Props {
  label: string;
  icon: string;
}
const props: Props = defineProps<Props>();
</script>
