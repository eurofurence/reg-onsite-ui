<template>
  <div class="flex flex-col gap-2">
    <ItemFrequencyChart
      :infosMap="modelValue.infos"
      :attendeeInfos="attendeeInfos"
      :soldCount="configCounts.soldCount"
      :inventoryCount="configCounts.inventoryCount"
    />
    <ItemTreeTable :nodes="itemTreeNodes" />
  </div>
</template>

<script setup lang="ts">
import ItemFrequencyChart from "@/components/statistics/ItemFrequencyChart.vue";
import ItemTreeTable from "@/components/statistics/ItemTreeTable.vue";
import { buildItemTree } from "@/composables/items/buildItemTreeNodes";
import {
  getSponsorDeskConfigCounts,
  type SponsorDeskConfigCounts,
} from "@/composables/items/getSponsorDeskConfigCounts";
import type { ApiAllAddInfo } from "@/types/external/attsrv/additional-info/common";
import type { ApiSponsorDeskAddInfo } from "@/types/external/attsrv/additional-info/sponsordesk";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import { computed, onMounted, ref, type Ref } from "vue";

interface Props {
  attendeeInfos: TransformedAttendeeInfo[];
}
const props = defineProps<Props>();

const modelValue = defineModel<ApiAllAddInfo<ApiSponsorDeskAddInfo>>({
  required: true,
});

const configCounts: Ref<SponsorDeskConfigCounts> = ref({
  soldCount: {},
  inventoryCount: {},
});
onMounted(async () => {
  configCounts.value = await getSponsorDeskConfigCounts(() => {});
});

const itemTreeNodes = computed(() =>
  buildItemTree(
    modelValue.value.infos,
    props.attendeeInfos,
    configCounts.value.soldCount,
    configCounts.value.inventoryCount,
  ),
);
</script>
