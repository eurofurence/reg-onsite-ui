<template>
  <div class="relative w-full top-5">
    <Message
      :severity="MessageSeverity.secondary"
      class="m-1 absolute top-0 left-1/2 -translate-x-1/2 min-w-60"
      closable
    >
      Keyboard Shortcuts:
      <div class="grid grid-cols-2 pt-4 grid-flow-row items-center gap-1">
        <slot />
      </div>
    </Message>
  </div>
</template>

<script setup>
import { MessageSeverity } from "@/types/internal/primevue";
import Message from "@/volt/Message.vue";
</script>
