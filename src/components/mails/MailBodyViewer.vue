<template>
  <div v-if="subject !== null" class="flex flex-col gap-1 mb-3">
    <div class="text-surface-500">Subject</div>
    <div>{{ subject }}</div>
  </div>
  <div v-if="html" class="flex flex-col gap-1">
    <div class="text-surface-500">HTML body</div>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div
      v-if="renderHtml"
      v-html="html"
      class="bg-surface-100 dark:bg-surface-900 rounded-md p-3 max-h-96 overflow-y-auto"
    ></div>
    <pre
      v-else
      class="whitespace-pre-wrap font-mono text-surface-700 bg-surface-100 dark:bg-surface-900 rounded-md p-3 max-h-96 overflow-y-auto"
    >{{ html }}</pre>
  </div>
  <div v-if="text" class="flex flex-col gap-1 mt-3">
    <div class="text-surface-500">Plain text body</div>
    <pre
      class="whitespace-pre-wrap font-mono text-surface-700 bg-surface-100 dark:bg-surface-900 rounded-md p-3 max-h-96 overflow-y-auto"
    >{{ text }}</pre>
  </div>
  <div
    v-if="html === null && text === null && emptyMessage !== null"
    class="text-surface-500"
  >
    {{ emptyMessage }}
  </div>
</template>

<script setup lang="ts">
interface Props {
  subject: string | null;
  html: string | null;
  text: string | null;
  renderHtml: boolean;
  emptyMessage?: string | null;
}
withDefaults(defineProps<Props>(), {
  emptyMessage: null,
});
</script>