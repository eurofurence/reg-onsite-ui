<template>
  <div class="flex flex-col">
    <AttendeeChart
      chartType="bar"
      cssClass="w-192"
      :label="label"
      :chartOptions="isLog ? barlogYChartOptions : {}"
      :data="data"
      @chartSelect="(v) => emit('chartSelect', v)"
    />
    <div class="flex flex-row flex-grow mx-auto">
      <div><ToggleSwitch v-model="isLog" /></div>
      <div class="pl-2">Log</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AttendeeChart from "@/components/statistics/AttendeeChart.vue";
import type { ChartData } from "@/types/internal/statistics";
import ToggleSwitch from "@/volt/ToggleSwitch.vue";
import { ref, type Ref } from "vue";

interface Props {
  label: string;
  data: ChartData;
}
defineProps<Props>();

const emit = defineEmits<{
  chartSelect: [value: string];
}>();

const isLog: Ref<boolean> = ref(false);

const barlogYChartOptions: any = {
  plugins: {
    legend: {
      labels: {
        usePointStyle: true,
      },
    },
  },
  scales: {
    y: {
      min: 0.9,
      display: true,
      type: "logarithmic",
    },
  },
};
</script>
