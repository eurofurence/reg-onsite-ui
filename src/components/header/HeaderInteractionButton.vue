<template>
  <Button @click="$emit('click', $event)">
    <slot></slot>
  </Button>
</template>

<script setup lang="ts">
import Button from "@/volt/Button.vue";
defineEmits(["click"]);
</script>
