<template>
  <Dialog v-model:visible="isVisible" modal :dismissableMask="false" :closeOnEscape="false" :closable="false" class="w-[32rem]">
    <template #header>
      <div class="flex flex-row items-center text-2xl">
        <i class="pi pi-exclamation-triangle pr-2" />
        {{ failedItems.length }} {{ failedItems.length === 1 ? itemLabelSingular : itemLabelPlural }} failed
      </div>
    </template>
    <div class="flex flex-col gap-2">
      <p class="text-sm text-surface-700">{{ message }}</p>
      <ul class="max-h-40 list-disc overflow-y-auto pl-5 text-sm text-surface-700">
        <li v-for="(item, index) in failedItems" :key="itemKey(item, index)">
          <slot name="item" :item="item">{{ item }}</slot>
        </li>
      </ul>
      <div class="flex flex-row justify-end gap-2">
        <Button label="Cancel" severity="danger" outlined @click="resolveWith('cancel')" />
        <Button label="Skip Failed" severity="secondary" @click="resolveWith('skip')" />
        <Button label="Retry Failed" @click="resolveWith('retry')" />
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts" generic="T">
import Button from "@/volt/Button.vue";
import Dialog from "@/volt/Dialog.vue";
import { ref, type Ref } from "vue";

export type RetryFailedDecision = "retry" | "skip" | "cancel";

interface Props {
  message: string;
  itemLabelSingular: string;
  itemLabelPlural: string;
  itemKey: (item: T, index: number) => string | number;
}

defineProps<Props>();

const isVisible = ref(false);
const failedItems: Ref<T[]> = ref([]);
let resolveDecision: ((decision: RetryFailedDecision) => void) | null = null;

function resolveWith(decision: RetryFailedDecision) {
  isVisible.value = false;
  resolveDecision?.(decision);
  resolveDecision = null;
}

async function confirmRetry(items: T[]): Promise<RetryFailedDecision> {
  failedItems.value = items;
  isVisible.value = true;
  return new Promise<RetryFailedDecision>((resolve) => {
    resolveDecision = resolve;
  });
}

defineExpose({ confirmRetry });
</script>
