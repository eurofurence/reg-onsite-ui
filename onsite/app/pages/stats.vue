<template>
  <Toast :group="toastGroup" position="bottom-right" />

  <LayoutOnsitePage title="Statistics">
    <div class="flex flex-grow">
      <div class="m-auto">
        <CustomStatisticsAttendee v-model="transformedAttendeeInfoRef" />
      </div>
    </div>
  </LayoutOnsitePage>
</template>

<script setup lang="ts">
import { getErrorHandlerFunction } from "@/composables/api/base/getErrorHandlerFunction";
import { attendeeService } from "@/composables/services/attendeeService";
import type { TransformedAttendeeInfo } from "@/types/internal";
import type { ToastServiceMethods } from "primevue/toastservice";

const toast: ToastServiceMethods = useToast();

const componentId: string = generateId(useId());
const toastGroup: string = `statistics${componentId}`;

const transformedAttendeeInfoRef: Ref<TransformedAttendeeInfo[]> = ref<
  TransformedAttendeeInfo[]
>(
  (await attendeeService.getAllAttendees(
    getErrorHandlerFunction(toast, toastGroup)
  )) || []
);
</script>
