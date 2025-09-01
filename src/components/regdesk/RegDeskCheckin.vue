<template>
  <div class="flex flex-row flex-grow items-center justify-center">
    <div class="flex flex-col gap-2">
      <RegDeskUserInfo
        :class="getInactiveStyle()"
        v-model="selectedAttendeeRef"
      />
      <RegDeskUserDetail
        :class="getInactiveStyle()"
        v-model="selectedAttendeeRef"
        v-model:searchStatus="searchStatusRef"
        :enableCashierMode="props.enableCashierMode"
        @onCheckin="$emit('onCheckin', $event)"
        @onPayment="$emit('onPayment', $event)"
        @onUndoCheckin="$emit('onUndoCheckin', $event)"
        @onSearchRegNumber="$emit('onSearchRegNumber', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import RegDeskUserDetail from "@/components/regdesk/RegDeskUserDetail.vue";
import RegDeskUserInfo from "@/components/regdesk/RegDeskUserInfo.vue";
import { getInactiveStyle } from "@/composables/colors/getInactiveStyle";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type { SearchStatus } from "@/types/internal/component/regnumsearch";
import type { ModelRef } from "vue";

interface Props {
  enableCashierMode?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  enableCashierMode: false,
});

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
defineEmits(["onCheckin", "onUndoCheckin", "onSearchRegNumber", "onPayment"]);
</script>
