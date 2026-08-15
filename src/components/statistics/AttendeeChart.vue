<template>
  <div class="grid-cols-1">
    <label class="flex justify-center">{{ props.label }}</label>
    <div
      v-if="props.data.values.length === 0"
      :class="[props.cssClass, 'flex items-center justify-center text-surface-400 text-sm']"
    >
      No data
    </div>
    <Chart
      v-else
      :type="props.chartType"
      :data="props.data"
      :options="props?.chartOptions || defaultChartOptions"
      :class="props.cssClass"
      @select="onSelect"
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

const emit = defineEmits<{
  chartSelect: [value: string];
}>();

function onSelect(event: { element: { index: number } }): void {
  const value: string | undefined = props.data.values[event.element.index];
  if (value !== undefined) {
    emit("chartSelect", value);
  }
}
</script>
