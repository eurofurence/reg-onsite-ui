<template>
  <div class="flex flex-col gap-8">
    <div class="flex flex-wrap gap-5 place-content-center">
      <ItemFrequencyChart :infosMap="modelValue.infos" :attendeeInfos="attendeeInfos" />
      <ItemTShirtCharts :infosMap="modelValue.infos" :attendeeInfos="attendeeInfos" />
    </div>
    <ItemTreeTable :nodes="itemTreeNodes" />
  </div>
</template>

<script setup lang="ts">
import ItemFrequencyChart from "@/components/statistics/ItemFrequencyChart.vue";
import ItemTShirtCharts from "@/components/statistics/ItemTShirtCharts.vue";
import ItemTreeTable from "@/components/statistics/ItemTreeTable.vue";
import { buildItemTree } from "@/composables/items/buildItemTreeNodes";
import type { ApiAllAddInfo } from "@/types/external/attsrv/additional-info/common";
import type { ApiSponsorDeskAddInfo } from "@/types/external/attsrv/additional-info/sponsordesk";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import { computed } from "vue";

interface Props { attendeeInfos: TransformedAttendeeInfo[]; }
const props = defineProps<Props>();

const modelValue = defineModel<ApiAllAddInfo<ApiSponsorDeskAddInfo>>({ required: true });

const itemTreeNodes = computed(() => buildItemTree(modelValue.value.infos, props.attendeeInfos));
</script>
