<template>
  <Toast :group="toastService.toastGroup" position="bottom-right" />
  <div class="flex flex-col flex-grow gap-5">
    <ProgressBar v-if="isLoading" indeterminate />
    <Tabs v-model:value="activeTabRef">
      <TabList pt:content="flex justify-center">
        <Tab value="attendees">Attendee Statistics</Tab>
        <Tab value="regdesk">Regdesk Statistics</Tab>
        <Tab value="items">Item Statistics</Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="attendees">
          <AttendeeStatistics v-model="transformedAttendeeInfoRef" />
        </TabPanel>
        <TabPanel value="regdesk">
          <CheckinStatistics v-model="regDeskInfoRef" :attendeeInfos="transformedAttendeeInfoRef" />
        </TabPanel>
        <TabPanel value="items">
          <ItemStatistics
            v-model="sponsorDeskInfoRef"
            :attendeeInfos="transformedAttendeeInfoRef"
          />
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
import AttendeeStatistics from "@/components/statistics/AttendeeStatistics.vue";
import CheckinStatistics from "@/components/statistics/CheckinStatistics.vue";
import ItemStatistics from "@/components/statistics/ItemStatistics.vue";
import { getErrorHandlerFunction } from "@/composables/api/base/getErrorHandlerFunction";
import { setupEventListener } from "@/composables/events/setupEventListener";
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
import ProgressBar from "@/volt/ProgressBar.vue";
import { computed, onMounted, ref, watch, type Ref, useId } from "vue";

const componentId: string = generateId(useId());
const toastService: OnsiteToastService = new OnsiteToastService(componentId);

const validTabValues = ["attendees", "regdesk", "items"];

function getTabFromRoute(): string {
  const hashTab = window.location.hash.slice(1);
  return validTabValues.includes(hashTab) ? hashTab : "attendees";
}

const activeTabRef: Ref<string> = ref(getTabFromRoute());

watch(activeTabRef, (tab) => {
  window.location.hash = `#${tab}`;
});

setupEventListener(window, "hashchange", () => {
  activeTabRef.value = getTabFromRoute();
});

const isLoadingAttendeeData: Ref<boolean> = ref(true);
const isLoadingRegDeskData: Ref<boolean> = ref(true);
const isLoadingSponsorDeskData: Ref<boolean> = ref(true);
const isLoading = computed(
  () =>
    isLoadingAttendeeData.value ||
    isLoadingRegDeskData.value ||
    isLoadingSponsorDeskData.value
);

const transformedAttendeeInfoRef: Ref<TransformedAttendeeInfo[]> = ref<
  TransformedAttendeeInfo[]
>([]);

async function retrieveAttendeeData(): Promise<void> {
  try {
    transformedAttendeeInfoRef.value =
      (await attendeeService.getAllAttendees(
        getErrorHandlerFunction(toastService)
      )) || [];
  } finally {
    isLoadingAttendeeData.value = false;
  }
}
onMounted(retrieveAttendeeData);

const regDeskInfoRef: Ref<ApiAllAddInfo<ApiRegDeskAddInfo>> = ref<
  ApiAllAddInfo<ApiRegDeskAddInfo>
>({ area: "regdesk", infos: new Map() });

async function retrieveRegDeskData(): Promise<void> {
  try {
    const regDeskData: ApiAllAddInfo<ApiRegDeskAddInfo> | undefined =
      await attendeeService.addInfos.getAllRegDeskAddInfos(
        getErrorHandlerFunction(toastService)
      );
    if (regDeskData) {
      regDeskInfoRef.value = regDeskData;
    }
  } finally {
    isLoadingRegDeskData.value = false;
  }
}
onMounted(retrieveRegDeskData);

const sponsorDeskInfoRef: Ref<ApiAllAddInfo<ApiSponsorDeskAddInfo>> = ref<
  ApiAllAddInfo<ApiSponsorDeskAddInfo>
>({ area: "sponsordesk", infos: new Map() });

async function retrieveSponsorDeskData(): Promise<void> {
  try {
    const sponsorDeskData: ApiAllAddInfo<ApiSponsorDeskAddInfo> | undefined =
      await attendeeService.addInfos.getAllSponsorDeskAddInfos(
        getErrorHandlerFunction(toastService)
      );
    if (sponsorDeskData) {
      sponsorDeskInfoRef.value = sponsorDeskData;
    }
  } finally {
    isLoadingSponsorDeskData.value = false;
  }
}
onMounted(retrieveSponsorDeskData);
</script>
