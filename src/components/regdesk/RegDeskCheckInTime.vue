<template>
  <small v-if="fetchFailed" class="text-red-500">
    Checked in: unavailable (failed to load)
  </small>
  <small v-else> Checked in: {{ checkinTime }} </small>
</template>

<script setup lang="ts">
import { attendeeService } from "@/composables/services/attendeeService";
import type { ApiRegDeskAddInfo } from "@/types/external/attsrv/additional-info/regdesk";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { RestErrorInfo } from "@/types/internal/rest";
import type { ModelRef } from "vue";
import { onMounted, ref, watch, type Ref } from "vue";

const checkinTime: Ref<string> = ref("");
const fetchFailed: Ref<boolean> = ref(false);

const regNumberRef: ModelRef<RegNumber> = defineModel<RegNumber>({
  required: true,
});

async function getCheckinTime(): Promise<void> {
  fetchFailed.value = false;
  const regDeskInfo: ApiRegDeskAddInfo | null | undefined =
    await attendeeService.addInfos.getRegDeskDeskAddInfo(
      (_info: RestErrorInfo) => {
        fetchFailed.value = true;
      },
      regNumberRef.value
    );
  if (
    regDeskInfo === null ||
    regDeskInfo === undefined ||
    !regDeskInfo.checkin_time
  ) {
    checkinTime.value = "";
  } else {
    checkinTime.value =
      new Date(regDeskInfo.checkin_time).toLocaleString() || "";
  }
}

onMounted(getCheckinTime);
watch(regNumberRef, getCheckinTime);
</script>
