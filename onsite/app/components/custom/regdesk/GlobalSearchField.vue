<template>
  <div v-if="dataOptionsRef.filterConfig.globalFilterFields.length > 0">
    <IconField>
      <InputIcon class="pi pi-search" />
      <InputText
        v-model="dataOptionsRef.filterConfig.filterValues.global.value"
        placeholder="Global Search"
        :id="props.globaSearchInputId"
        v-bind="$attrs"
      />
    </IconField>
  </div>
</template>

<script setup lang="ts">
import type { ModelRef } from "vue";
import type { AttendeeDataOptions } from "@/types/internal/system/regdesk";

interface Props {
  globaSearchInputId: string;
}

const props: Props = defineProps<Props>();
const dataOptionsRef: ModelRef<AttendeeDataOptions> =
  defineModel<AttendeeDataOptions>({ required: true });
</script>
