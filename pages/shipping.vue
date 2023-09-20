<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <OnsitePageBase title="Eurofurence 27 - Goodies" :customize="false">
    <div class="flex align-items-center justify-content-center pt-5">
      <div v-for="attendeeReg in attendeeRegs.data.ids" :key="attendeeReg">
        <GoodieElement :reg="attendeeReg" />
      </div>
    </div>
  </OnsitePageBase>
</template>

<script setup>
import { getApi } from "@/composables/restApi";
import GoodieElement from "@/components/panels/GoodieElement";

async function apiGetAttendeeRegs() {
  const response = await getApi(`attsrv/api/rest/v1/attendees`);
  const data = await response.json();
  return { response, data };
}
const attendeeRegs = await apiGetAttendeeRegs()
</script>