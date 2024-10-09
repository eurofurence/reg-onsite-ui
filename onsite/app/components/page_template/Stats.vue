<template>
  <Toast :group="toastService.toastGroup" position="bottom-right" />
  <div class="flex flex-grow">
    <div class="m-auto">
      <CustomStatisticsAttendee v-model="transformedAttendeeInfoRef" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { getErrorHandlerFunction } from "@/composables/api/base/getErrorHandlerFunction";
import { attendeeService } from "@/composables/services/attendeeService";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import { OnsiteToastService } from "@/composables/services/toastService";

const componentId: string = generateId(useId());
const toastService: OnsiteToastService = new OnsiteToastService(componentId);

const transformedAttendeeInfoRef: Ref<TransformedAttendeeInfo[]> = ref<
  TransformedAttendeeInfo[]
>(
  (await attendeeService.getAllAttendees(
    getErrorHandlerFunction(toastService)
  )) || []
);
</script>
