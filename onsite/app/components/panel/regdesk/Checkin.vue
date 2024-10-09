<template>
  <div class="flex flex-col gap-2 mx-auto">
    <PanelRegdeskUserInfo readonly v-model="selectedAttendeeRef" />
    <PanelRegdeskUserDetail
      readonly
      v-model="selectedAttendeeRef"
      v-model:searchStatus="searchStatusRef"
      @onCheckin="$emit('onCheckin', $event)"
      @onUndoCheckin="$emit('onUndoCheckin', $event)"
      @onSearchRegNumber="$emit('onSearchRegNumber', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import type { ModelRef } from "vue";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type { SearchStatus } from "@/types/internal/component/regnumsearch";

const searchStatusRef: ModelRef<SearchStatus> = defineModel<SearchStatus>(
  "searchStatus",
  {
    required: true,
  }
);
const selectedAttendeeRef: ModelRef<TransformedAttendeeInfo> =
  defineModel<TransformedAttendeeInfo>({
    required: true,
  });
defineEmits(["onCheckin", "onUndoCheckin", "onSearchRegNumber"]);
</script>
