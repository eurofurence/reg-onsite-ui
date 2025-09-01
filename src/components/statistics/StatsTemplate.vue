<template>
  <Toast :group="toastService.toastGroup" position="bottom-right" />
  <div class="flex flex-col flex-grow gap-5">
    <Tabs value="0">
      <TabList pt:content="flex justify-center">
        <Tab value="0">Attendee Statistics</Tab>
        <Tab value="1">Regdesk Statistics</Tab>
        <Tab value="2">Item Statistics</Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="0">
          <AttendeeStatistics v-model="transformedAttendeeInfoRef" />
        </TabPanel>
        <TabPanel value="1">
          <CheckinStatistics v-model="regDeskInfoRef" />
        </TabPanel>
        <TabPanel value="2">
          <SponsorStatistics v-model="sponsorDeskInfoRef" />
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
import AttendeeStatistics from "@/components/statistics/AttendeeStatistics.vue";
import CheckinStatistics from "@/components/statistics/CheckinStatistics.vue";
import SponsorStatistics from "@/components/statistics/SponsorStatistics.vue";
import { getErrorHandlerFunction } from "@/composables/api/base/getErrorHandlerFunction";
import { generateId } from "@/composables/generateId";
import { attendeeService } from "@/composables/services/attendeeService";
import { OnsiteToastService } from "@/composables/services/toastService";
import type { ApiAllAddInfo } from "@/types/external/attsrv/additional-info/common";
import type { ApiRegDeskAddInfo } from "@/types/external/attsrv/additional-info/regdesk";
import type { ApiSponsorDeskAddInfo } from "@/types/external/attsrv/additional-info/sponsordesk";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import Tab from "@/volt/Tab.vue";
import TabList from "@/volt/TabList.vue";
import TabPanel from "@/volt/TabPanel.vue";
import TabPanels from "@/volt/TabPanels.vue";
import Tabs from "@/volt/Tabs.vue";
import Toast from "@/volt/Toast.vue";
import { onMounted, ref, type Ref, useId } from "vue";

const componentId: string = generateId(useId());
const toastService: OnsiteToastService = new OnsiteToastService(componentId);

const transformedAttendeeInfoRef: Ref<TransformedAttendeeInfo[]> = ref<
  TransformedAttendeeInfo[]
>([]);

async function retrieveAttendeeData(): Promise<void> {
  transformedAttendeeInfoRef.value =
    (await attendeeService.getAllAttendees(
      getErrorHandlerFunction(toastService)
    )) || [];
}
onMounted(retrieveAttendeeData);

const regDeskInfoRef: Ref<ApiAllAddInfo<ApiRegDeskAddInfo>> = ref<
  ApiAllAddInfo<ApiRegDeskAddInfo>
>({ area: "regdesk", infos: new Map() });

async function retrieveRegDeskData(): Promise<void> {
  const regDeskData: ApiAllAddInfo<ApiRegDeskAddInfo> | undefined =
    await attendeeService.addInfos.getAllRegDeskAddInfos(
      getErrorHandlerFunction(toastService)
    );
  if (regDeskData) {
    regDeskInfoRef.value = regDeskData;
  }
}
onMounted(retrieveRegDeskData);

const sponsorDeskInfoRef: Ref<ApiAllAddInfo<ApiSponsorDeskAddInfo>> = ref<
  ApiAllAddInfo<ApiSponsorDeskAddInfo>
>({ area: "sponsordesk", infos: new Map() });

async function retrieveSponsorDeskData(): Promise<void> {
  const sponsorDeskData: ApiAllAddInfo<ApiSponsorDeskAddInfo> | undefined =
    await attendeeService.addInfos.getAllSponsorDeskAddInfos(
      getErrorHandlerFunction(toastService)
    );
  if (sponsorDeskData) {
    sponsorDeskInfoRef.value = sponsorDeskData;
  }
}
onMounted(retrieveSponsorDeskData);
</script>
