<template>
  <Message :severity="props.severity" class="stm-message" :closable="false">
    <template #messageicon>
      <i class="pi pi-info-circle stm-icon"></i>
    </template>
    <div class="stm-header">{{ props.title }}</div>
    <div class="stm-content">
      <slot></slot>
    </div>
  </Message>
</template>

<script setup lang="ts">
import Message from "primevue/message";
import type { SeverityValue } from "@/types/internal";

interface Props {
  severity: SeverityValue;
  title: string;
}
const props: Props = defineProps<Props>();
</script>

<style>
.stm-message {
  margin-top: 1rem;
  margin-right: 1rem;
  margin-left: auto;
  margin-right: auto;
  max-width: 80vw;
}

.stm-icon {
  width: 4rem;
  font-size: 3rem;
  margin-left: 0rem;
  margin-right: 1rem;
}

.stm-header {
  font-size: 1.75rem;
  font-weight: bold;
}

.stm-content {
  font-size: 1.5rem;
  max-width: 70vw;
}

.stm-content > ul {
  margin: 0.25em;
  padding: 0.5rem;
}

.stm-content > ul > li {
  white-space: normal;
}
</style>
