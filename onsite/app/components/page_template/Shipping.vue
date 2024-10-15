<template>
  <Toast :group="toastService.toastGroup" position="bottom-right" />
  <div class="flex flex-grow">
    <div class="m-auto">
      <div class="flex align-items-center justify-content-center pt-5">
        <div
          v-if="attendeeList"
          v-for="attendeeReg in attendeeList"
          :key="attendeeReg"
        >
          <PanelShippingMainElement :regNumber="attendeeReg" />
        </div>
        <div v-else>There are no registrations for the current user!</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getErrorHandlerFunction } from "@/composables/api/base/getErrorHandlerFunction";
import { attendeeService } from "@/composables/services/attendeeService";
import { OnsiteToastService } from "@/composables/services/toastService";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";

const componentId: string = generateId(useId());
const toastService: OnsiteToastService = new OnsiteToastService(componentId);

async function getListOfOwnRegs(): Promise<RegNumber[]> {
  const response: RegNumber[] | undefined = await attendeeService.getOwnRegs(
    getErrorHandlerFunction(toastService)
  );
  return response || [];
}
const attendeeList: RegNumber[] = await getListOfOwnRegs();
</script>
