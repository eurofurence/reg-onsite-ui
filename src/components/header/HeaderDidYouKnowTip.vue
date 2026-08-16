<template>
  <div
    v-if="visible"
    class="text-xs text-surface-500 flex items-center px-2 transition-opacity"
  >
    💡 Did you know? {{ currentFact }}
  </div>
</template>

<script setup lang="ts">
import { didYouKnowFacts } from "@/config/theme/didYouKnowFacts";
import { scheduleRegularTask } from "@/composables/events/scheduleRegularTask";
import { themeSettings } from "@/composables/theme/initTheme";
import type { DurationInMS } from "@/types/internal/common";
import { computed, onUnmounted, ref, watch, type Ref } from "vue";

const TIP_VISIBLE_DURATION = 20_000 as DurationInMS;
const TIP_INTERVAL_BASE = (1000 * 60 * 2) as DurationInMS;
const TIP_INTERVAL_VARIANCE = (1000 * 60 * 3) as DurationInMS;

interface Props {
  pageTips?: string[];
}
const props = withDefaults(defineProps<Props>(), {
  pageTips: () => [],
});

const facts = computed<string[]>(() => [
  ...didYouKnowFacts,
  ...props.pageTips,
]);

const visible: Ref<boolean> = ref(false);
const currentFact: Ref<string> = ref("");

let hideTimeoutId: ReturnType<typeof setTimeout> | undefined;
let regularTaskId: ReturnType<typeof scheduleRegularTask> | undefined;

function showRandomFact(): void {
  currentFact.value = facts.value[Math.floor(Math.random() * facts.value.length)]!;
  visible.value = true;
  clearTimeout(hideTimeoutId);
  hideTimeoutId = setTimeout(() => {
    visible.value = false;
  }, TIP_VISIBLE_DURATION);
}

function stopTips(): void {
  clearInterval(regularTaskId);
  regularTaskId = undefined;
  clearTimeout(hideTimeoutId);
  visible.value = false;
}

function startTips(): void {
  if (regularTaskId !== undefined) {
    return;
  }
  regularTaskId = scheduleRegularTask(
    showRandomFact,
    TIP_INTERVAL_BASE,
    TIP_INTERVAL_VARIANCE
  );
}

watch(
  () => themeSettings.value.showDidYouKnowTips,
  (isEnabled) => {
    if (isEnabled) {
      startTips();
    } else {
      stopTips();
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  stopTips();
});
</script>
