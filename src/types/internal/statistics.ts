import type { ColorsPaletteValue } from "@/composables/theme/colors";

export interface ChartData {
  labels: any;
  values: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    hoverBackgroundColor: string[];
  }[];
}

export interface StatsConfig {
  flatten?: boolean;
  color?: ColorsPaletteValue | undefined;
  sort?: "value" | "label";
}
