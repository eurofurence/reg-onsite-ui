<template>
  <div v-if="dataOptionsRef.filterConfig.globalFilterFields.length > 0">
    <div class="relative">
      <i
        class="pi pi-search absolute top-1/2 -mt-2 text-surface-400 leading-none start-3 z-1"
      />
      <InputText
        v-model="dataOptionsRef.filterConfig.filterValues.global.value"
        pt:root="h-12 ps-10"
        placeholder="Global Search"
        :id="props.globaSearchInputId"
        v-bind="$attrs"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AttendeeDataOptions } from "@/types/internal/system/regdesk";
import InputText from "@/volt/InputText.vue";
import type { ModelRef } from "vue";

interface Props {
  globaSearchInputId: string;
}

const props: Props = defineProps<Props>();
const dataOptionsRef: ModelRef<AttendeeDataOptions> =
  defineModel<AttendeeDataOptions>({ required: true });
</script>
