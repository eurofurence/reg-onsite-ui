<template>
  <div class="onsite-app">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script lang="ts">
import { initTheme } from "@/composables/theme/initTheme";

initTheme();
</script>

<style lang="css">
.onsite-app {
  z-index: 0;
}

.onsite-app .p-skeleton::after {
  /* Slow down pulsing of the skeleton animation */
  animation: p-skeleton-animation 5s infinite;
}
</style>
