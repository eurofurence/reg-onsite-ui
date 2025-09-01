<template>
  <div class="grid-cols-1">
    <label class="flex justify-center">{{ props.label }}</label>
    <Chart
      :type="props.chartType"
      :data="props.data"
      :options="props?.chartOptions || defaultChartOptions"
      :class="props.cssClass"
    />
  </div>
</template>

<script setup lang="ts">
import type { ChartData } from "@/types/internal/statistics";
import Chart from "primevue/chart";

const defaultChartOptions: any = {
  plugins: {
    legend: {
      labels: {
        usePointStyle: true,
      },
    },
  },
};

interface Props {
  label: string;
  data: ChartData;
  chartType?: string;
  cssClass?: string;
  chartOptions?: any;
}
const props = withDefaults(defineProps<Props>(), {
  chartType: "pie",
  cssClass: "w-96 h-96",
});
</script>
