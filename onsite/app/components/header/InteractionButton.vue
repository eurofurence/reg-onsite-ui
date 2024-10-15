<template>
  <span class="header-button">
    <Button v-bind="$attrs" @click="$emit('click', $event)">
      <slot></slot>
    </Button>
  </span>
</template>

<script setup lang="ts">
defineEmits(["click"]);
</script>

<style lang="css">
.header-button button.p-button-icon-only {
  width: calc(var(--header-size) * 50px);
}

.header-button button {
  height: calc(var(--header-size) * 50px);
  font-size: calc(var(--header-size) * 20px);
  padding-left: calc(var(--header-size) * 20px);
  padding-right: calc(var(--header-size) * 20px);
  padding-top: calc(var(--header-size) * 5px);
  padding-bottom: calc(var(--header-size) * 5px);
}

.header-button button .pi {
  font-size: calc(var(--header-size) * 20px);
}
</style>
