<template>
  <div class="group-panel">
    <Fieldset>
      <template #legend>
        <span class="text-primary mr-2 pi" :class="props.icon"> </span>
        <span class="text-primary font-bold text-lg">{{ props.label }}</span>
      </template>
      <slot />
    </Fieldset>
  </div>
</template>

<script setup lang="ts">
interface Props {
  label: string;
  icon: string;
}
const props: Props = defineProps<Props>();
</script>

<style>
/*
.group-panel > .p-fieldset {
  padding: 0.25em;
  padding-top: 0.75em;
}
*/
.group-panel > .p-fieldset .p-fieldset-legend {
  padding: 0.5em;
  /*
  padding-top: 0.1em;
  padding-bottom: 0.1em;
*/
}

.group-panel > .p-fieldset .p-fieldset-content {
  padding: 0.25em;
  /*  padding: 0em;*/
}
</style>
