<template>
  <div v-if="dataOptionsRef.globalFilterFields.length > 0">
    <IconField>
      <InputIcon class="pi pi-search" />
      <InputText
        v-model="dataOptionsRef.filters.global.value"
        placeholder="Global Search"
        :id="props.globaSearchInputId"
        v-bind="$attrs"
      />
    </IconField>
  </div>
</template>

<script setup lang="ts">
import type { ModelRef } from "vue";
import type { AttendeeDataOptions } from "@/types/internal";

interface Props {
  globaSearchInputId: string
};

const props: Props = defineProps<Props>();
const dataOptionsRef: ModelRef<AttendeeDataOptions> =
  defineModel<AttendeeDataOptions>({ required: true });
</script>
