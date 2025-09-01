<template>
  <div class="flex flex-grow flex-row text-2xl items-center">
    <i :class="props.icon" class="pr-2" v-if="props.icon" />
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  icon?: string;
}
const props = withDefaults(defineProps<Props>(), {
  icon: "pi pi-exclamation-circle",
});
</script>
