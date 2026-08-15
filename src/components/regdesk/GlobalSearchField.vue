<template>
  <div
    v-if="dataOptionsRef.filterConfig.globalFilterFields.length > 0"
    class="flex flex-col gap-1"
  >
    <label :for="props.globaSearchInputId" class="text-xs">Global Search</label>
    <div class="relative w-full">
      <i
        v-tooltip.bottom="isExact ? 'Exact match (↵ to switch)' : 'Contains (↵ for exact match)'"
        :class="['pi absolute top-1/2 -mt-2 leading-none start-3 z-1 cursor-pointer', isExact ? 'pi-equals text-primary' : 'pi-search text-surface-400']"
        @click="toggleMatchMode"
      />
      <InputText
        v-model="dataOptionsRef.filterConfig.filterValues.global.value"
        pt:root="h-12 ps-10 w-full"
        placeholder="Global Search"
        :id="props.globaSearchInputId"
        v-bind="$attrs"
        @keydown.enter.prevent.stop="onEnter"
        @keydown.escape.prevent.stop="onEscape"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { FilterMatchMode } from "@primevue/core/api";
import { doResetFilters } from "@/composables/filter/doResetFilters";
import type { AttendeeDataOptions } from "@/types/internal/system/regdesk";
import InputText from "@/volt/InputText.vue";
import { computed, type ModelRef } from "vue";

interface Props {
  globaSearchInputId: string;
}

const props: Props = defineProps<Props>();
const dataOptionsRef: ModelRef<AttendeeDataOptions> = defineModel<AttendeeDataOptions>({ required: true });
const emit = defineEmits<{ onSelectByNumber: [id: number] }>();

const isExact = computed(() =>
  dataOptionsRef.value.filterConfig.filterValues.global.matchMode === FilterMatchMode.EQUALS
);

function toggleMatchMode() {
  dataOptionsRef.value.filterConfig.filterValues.global.matchMode =
    isExact.value ? FilterMatchMode.CONTAINS : FilterMatchMode.EQUALS;
}

function onEscape() {
  doResetFilters(dataOptionsRef);
}

function onEnter() {
  const raw = dataOptionsRef.value.filterConfig.filterValues.global.value?.trim() ?? "";
  const num = Number(raw);
  if (raw && Number.isInteger(num) && num > 0) {
    emit("onSelectByNumber", num);
  }
  toggleMatchMode();
}
</script>
