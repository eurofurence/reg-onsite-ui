<template>
  <Toast :group="toastService.toastGroup" position="bottom-right" />
  <div class="flex flex-grow">
    <div class="m-auto">
      <div class="flex align-items-center justify-content-center pt-5">
        <div
          v-if="authState.userRegNumList"
          v-for="attendeeReg in authState.userRegNumList"
          :key="attendeeReg"
        >
          <ShippingMainElement :regNumber="attendeeReg" />
        </div>
        <div v-else>There are no registrations for the current user!</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ShippingMainElement from "@/components/shipping/ShippingMainElement.vue";
import { generateId } from "@/composables/generateId";
import { OnsiteToastService } from "@/composables/services/toastService";
import { authState } from "@/composables/state/authState";
import Toast from "@/volt/Toast.vue";
import { useId } from "vue";

const componentId: string = generateId(useId());
const toastService: OnsiteToastService = new OnsiteToastService(componentId);
</script>
