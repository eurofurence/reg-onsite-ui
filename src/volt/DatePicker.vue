<template>
  <DatePicker
    unstyled
    :pt="theme"
    :ptOptions="{ mergeProps: ptViewMerge }"
  >
    <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps ?? {}" />
    </template>
  </DatePicker>
</template>

<script setup lang="ts">
import { ptViewMerge } from "@/volt/utils";
import DatePicker, {
  type DatePickerPassThroughOptions,
  type DatePickerProps,
} from "primevue/datepicker";
import { ref } from "vue";

interface Props extends /* @vue-ignore */ DatePickerProps {}
defineProps<Props>();

const inputText = `appearance-none rounded-md outline-hidden w-full
      bg-surface-0 dark:bg-surface-950
      p-filled:bg-surface-50 dark:p-filled:bg-surface-800
      text-surface-700 dark:text-surface-0
      placeholder:text-surface-500 dark:placeholder:text-surface-400
      border border-surface-300 dark:border-surface-700
      enabled:hover:border-surface-400 dark:enabled:hover:border-surface-600
      enabled:focus:border-primary
      disabled:bg-surface-200 disabled:text-surface-500
      dark:disabled:bg-surface-700 dark:disabled:text-surface-400
      px-3 py-2
      transition-colors duration-200 shadow-[0_1px_2px_0_rgba(18,18,23,0.05)]`;

const theme = ref<DatePickerPassThroughOptions>({
  root: `inline-flex relative p-fluid:flex`,
  pcInputText: { root: inputText },
  panel: `min-w-[18rem] absolute bg-surface-0 dark:bg-surface-900
      border border-surface-200 dark:border-surface-700
      rounded-md shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)]
      p-3 z-50`,
  header: `flex items-center justify-between mb-2 pb-2
      border-b border-surface-200 dark:border-surface-700`,
  title: `flex gap-2 items-center`,
  selectMonth: `text-surface-700 dark:text-surface-0 font-semibold text-sm
      cursor-pointer hover:text-primary transition-colors`,
  selectYear: `text-surface-700 dark:text-surface-0 font-semibold text-sm
      cursor-pointer hover:text-primary transition-colors`,
  dayView: `w-full border-collapse`,
  tableHeader: ``,
  tableHeaderRow: ``,
  weekHeader: ``,
  weekHeaderLabel: ``,
  tableHeaderCell: `p-1 w-10 text-center`,
  weekDayCell: ``,
  weekDay: `text-xs font-semibold text-surface-500 dark:text-surface-400 text-center py-1`,
  tableBody: ``,
  tableBodyRow: ``,
  dayCell: `p-[0.125rem]`,
  day: `w-10 h-10 flex items-center justify-center rounded-full text-sm cursor-pointer select-none
      text-surface-700 dark:text-surface-0
      hover:bg-surface-100 dark:hover:bg-surface-800
      p-selected:bg-primary p-selected:text-primary-contrast p-selected:hover:bg-primary-emphasis
      p-disabled:text-surface-300 dark:p-disabled:text-surface-600 p-disabled:pointer-events-none
      p-today:font-bold p-today:text-primary
      transition-colors duration-200`,
  monthView: `w-full`,
  month: `w-1/3 inline-flex items-center justify-center py-2 px-1 rounded-md text-sm cursor-pointer
      text-surface-700 dark:text-surface-0
      hover:bg-surface-100 dark:hover:bg-surface-800
      p-selected:bg-primary p-selected:text-primary-contrast
      transition-colors duration-200`,
  yearView: `w-full`,
  year: `w-1/2 inline-flex items-center justify-center py-2 px-1 rounded-md text-sm cursor-pointer
      text-surface-700 dark:text-surface-0
      hover:bg-surface-100 dark:hover:bg-surface-800
      p-selected:bg-primary p-selected:text-primary-contrast
      transition-colors duration-200`,
  buttonbar: `flex justify-between pt-2 border-t border-surface-200 dark:border-surface-700 mt-2`,
  pcTodayButton: {
    root: `text-xs px-3 py-1.5 rounded-md bg-primary text-primary-contrast
          hover:bg-primary-emphasis transition-colors cursor-pointer`,
  },
  pcClearButton: {
    root: `text-xs px-3 py-1.5 rounded-md bg-surface-100 dark:bg-surface-800
          text-surface-700 dark:text-surface-0 hover:bg-surface-200 dark:hover:bg-surface-700
          transition-colors cursor-pointer`,
  },
  pcPrevButton: {
    root: `flex items-center justify-center w-8 h-8 rounded-full cursor-pointer
          text-surface-600 dark:text-surface-300
          hover:bg-surface-100 dark:hover:bg-surface-800
          transition-colors`,
  },
  pcNextButton: {
    root: `flex items-center justify-center w-8 h-8 rounded-full cursor-pointer
          text-surface-600 dark:text-surface-300
          hover:bg-surface-100 dark:hover:bg-surface-800
          transition-colors`,
  },
  transition: {
    enterFromClass: "opacity-0 scale-y-75",
    enterActiveClass: "transition duration-120 ease-[cubic-bezier(0,0,0.2,1)]",
    leaveActiveClass: "transition-opacity duration-100 ease-linear",
    leaveToClass: "opacity-0",
  },
});
</script>
