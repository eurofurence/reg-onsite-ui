<template>
  <div
    v-if="dataOptionsRef.queryMode === AttendeeQueryStrategy.preload"
    class="flex items-center gap-1"
  >
    <small v-if="preloadTimeRef !== null" class="pr-2">
      {{ getPreloadText() }}
    </small>
    <Button
      outlined
      icon="pi pi-refresh"
      v-tooltip.bottom="'Refresh preloaded data'"
      :disabled="!canReload()"
      @click="triggerLoad()"
    />
  </div>
</template>

<script setup lang="ts">
import type { ModelRef } from "vue";
import {
  AttendeeQueryStrategy,
  type AttendeeDataOptions,
} from "@/types/internal/system/regdesk";
import { scheduleRegularTask } from "@/composables/events/scheduleRegularTask";
import type { DurationInMS } from "@/types/internal/common";

const scheduledInterval: DurationInMS = (5 * 60 * 1000) as DurationInMS; // Every 5 minuts
const scheduledIntervalVariance: DurationInMS = (60 * 1000) as DurationInMS; // Introduce a variance of 1 minute
const cooldownDuration: DurationInMS = (3 * 1000) as DurationInMS; // Cooldown of 10 seconds between refreshs

const currentTimeRef: Ref<Date> = ref<Date>(new Date());
const preloadTimeRef: Ref<Date | null> = ref<Date | null>(null);

function getPreloadText(): string {
  if (preloadTimeRef.value !== null) {
    const lastUpdateStr = `Last update: ${preloadTimeRef.value.toLocaleTimeString()}`;
    if (dataOptionsRef.value.cachedRecords !== null) {
      return `${lastUpdateStr} (${dataOptionsRef.value.cachedRecords} records)`;
    }
    return lastUpdateStr;
  }
  return "";
}

function canReload(): boolean {
  if (preloadTimeRef.value === null) {
    return true;
  }
  return (
    currentTimeRef.value.valueOf() - preloadTimeRef.value.valueOf() >
    cooldownDuration
  );
}

async function triggerLoad() {
  if (canReload()) {
    preloadTimeRef.value = new Date();
    emit("doLoad");
  }
}

scheduleRegularTask(() => {
  currentTimeRef.value = new Date();
}, 1000 as DurationInMS);

onMounted(triggerLoad);
scheduleRegularTask(triggerLoad, scheduledInterval, scheduledIntervalVariance);

const dataOptionsRef: ModelRef<AttendeeDataOptions> =
  defineModel<AttendeeDataOptions>({ required: true });
const emit: CallableFunction = defineEmits(["doLoad"]);
</script>
