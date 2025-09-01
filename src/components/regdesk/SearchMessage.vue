<template>
  <div class="flex mx-auto">
    <Message :severity="props.severity" class="mt-4" :closable="false">
      <template #icon> </template>
      <div class="flex items-center text-[1.75rem] font-bold">
        <i class="pi pi-info-circle text-[3rem] mx-4"></i>{{ props.title }}
      </div>
      <div class="ml-20 text-[1.5rem]">
        <slot></slot>
      </div>
    </Message>
  </div>
</template>

<script setup lang="ts">
import type { MessageSeverityValue } from "@/types/internal/primevue";
import Message from "primevue/message";

interface Props {
  severity: MessageSeverityValue;
  title: string;
}
const props: Props = defineProps<Props>();
</script>
